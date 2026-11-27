import { randomUUID } from "node:crypto";
import { Buffer } from "node:buffer";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { db } from "../../prisma/db";
import { encrypt } from "../utils/invoice-encryption";
import { extractNfseData, NfseExtractionError } from "../utils/nfse";

const MAX_INVOICE_XML_BYTES = 5_000_000;

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event);
  if (!user) {
    throw createError({
      status: 401,
      statusText: "Unauthorized",
      message: "You must be authenticated to create a new record.",
    });
  }

  const contentType = getRequestHeader(event, "content-type")
    ?.split(";", 1)[0]
    ?.trim()
    .toLowerCase();

  if (contentType === "application/xml" || contentType === "text/xml") {
    const xml = await readInvoiceXml(event);
    return createInvoiceRecord(event, user, xml);
  }

  const body: unknown = await readBody(event);
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw createError({
      status: 400,
      statusText: "Bad Request",
      message: "Request body must be an object.",
    });
  }

  const input = body as Record<string, unknown>;

  if (input.type === "INVOICE") {
    throw createError({
      status: 415,
      statusText: "Unsupported Media Type",
      message: "Send an invoice as an application/xml request body.",
    });
  }

  if (input.type !== "MANUAL") {
    throw createError({
      status: 400,
      statusText: "Bad Request",
      message: "type must be MANUAL or INVOICE.",
    });
  }

  const amount = parseManualAmount(input.amount);
  if (amount === null) {
    throw createError({
      status: 400,
      statusText: "Bad Request",
      message:
        "amount must be a positive value with at most two decimal places.",
    });
  }

  if (input.direction !== "GAIN" && input.direction !== "LOSS") {
    throw createError({
      status: 400,
      statusText: "Bad Request",
      message: "direction must be GAIN or LOSS.",
    });
  }

  const source = input.source;
  const description = input.description;
  if (
    typeof source !== "string" ||
    !source.trim() ||
    (description !== undefined &&
      description !== null &&
      typeof description !== "string")
  ) {
    throw createError({
      status: 400,
      statusText: "Bad Request",
      message:
        "source must be a non-empty string and description must be a string or null.",
    });
  }

  const record = await db.orm.public.FinancialRecord.create({
    ownerId: user.id,
    type: input.type,
    amount,
    direction: input.direction,
    description:
      typeof description === "string" ? description.trim() || null : null,
    source: source.trim(),
  });

  console.log("Created new record:", record);

  setResponseStatus(event, 201);
  return record;
});

async function createInvoiceRecord(
  event: Parameters<typeof getAuthenticatedUser>[0],
  user: NonNullable<Awaited<ReturnType<typeof getAuthenticatedUser>>>,
  xml: string,
) {
  let nfseData: ReturnType<typeof extractNfseData>;
  try {
    nfseData = extractNfseData(xml);
  } catch (error) {
    if (error instanceof NfseExtractionError) {
      throw createError({
        status: 400,
        statusText: "Bad Request",
        message: error.message,
      });
    }
    throw error;
  }

  const config = useRuntimeConfig(event);
  if (
    !config.s3.endpoint ||
    !config.s3.bucket ||
    !config.s3.accessKey ||
    !config.s3.secretKey
  ) {
    throw createError({
      status: 503,
      statusText: "Service Unavailable",
      message: "Invoice storage is not configured.",
    });
  }
  if (!/^[\da-f]{64}$/i.test(config.fileEncryptionKey)) {
    throw createError({
      status: 503,
      statusText: "Service Unavailable",
      message: "Invoice encryption is not configured correctly.",
    });
  }

  const sourceFileKey = `invoices/${randomUUID()}.enc`;
  let uploaded = false;
  let encryptedXml: Buffer;

  try {
    encryptedXml = encrypt(
      Buffer.from(xml, "utf8"),
      config.fileEncryptionKey,
      sourceFileKey,
    );
  } catch (error) {
    console.error("Invoice XML encryption failed.", safeErrorName(error));
    throw createError({
      status: 500,
      statusText: "Internal Server Error",
      message: "The invoice file could not be encrypted.",
    });
  }

  const storage = new S3Client({
    endpoint: config.s3.endpoint,
    region: "us-east-1",
    forcePathStyle: true,
    credentials: {
      accessKeyId: config.s3.accessKey,
      secretAccessKey: config.s3.secretKey,
    },
  });

  try {
    await storage.send(
      new PutObjectCommand({
        Bucket: config.s3.bucket,
        Key: sourceFileKey,
        Body: encryptedXml,
        ContentType: "application/octet-stream",
      }),
    );
    uploaded = true;

    const documentNumber = nfseData.contractor.document;
    let contractorId = await db.orm.public.Contractor.select("id")
      .where((contractor) => contractor.document.eq(documentNumber))
      .first()
      .then((contractor) => contractor?.id);

    if (!contractorId) {
      contractorId = await db.orm.public.Contractor
        .create({ ...nfseData.contractor })
        .then((contractor) => contractor.id);
    }

    const newFinancialRecord = await db.orm.public.FinancialRecord.create({
      ...nfseData.financialRecord,
      contractorId,
      ownerId: user.id,
      direction: "GAIN",
      type: "INVOICE",
      source: "NFSe",
    });

    await db.orm.public.InvoiceMetadata.create({
      recordId: newFinancialRecord.id,
      ...nfseData.invoiceMetadata,
      issWithheld: false,
      sourceFileKey,
    });

    setResponseStatus(event, 201);
    return { id: newFinancialRecord.id, type: "INVOICE" };
  } catch (error) {
    try {
      await storage.send(
        new DeleteObjectCommand({
          Bucket: config.s3.bucket,
          Key: sourceFileKey,
        }),
      );
    } catch (cleanupError) {
      console.error(
        "Failed to remove an unreferenced invoice XML object.",
        safeErrorName(cleanupError),
      );
    }

    console.error(
      uploaded
        ? "Invoice record persistence failed."
        : "Invoice XML upload to object storage failed.",
      safeErrorName(error),
    );
    throw createError({
      status: uploaded ? 500 : 502,
      statusText: uploaded ? "Internal Server Error" : "Bad Gateway",
      message: uploaded
        ? "The invoice record could not be created."
        : "The invoice file could not be stored.",
    });
  } finally {
    storage.destroy();
  }
}

function safeErrorName(error: unknown): string {
  return error instanceof Error ? error.name : "UnknownError";
}

async function readInvoiceXml(event: Parameters<typeof getAuthenticatedUser>[0]) {
  const contentLength = getRequestHeader(event, "content-length");
  if (contentLength && Number(contentLength) > MAX_INVOICE_XML_BYTES) {
    throw createError({
      status: 413,
      statusText: "Payload Too Large",
      message: "The invoice XML file must be 5 MB or smaller.",
    });
  }

  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of event.node.req) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += bytes.byteLength;
    if (size > MAX_INVOICE_XML_BYTES) {
      throw createError({
        status: 413,
        statusText: "Payload Too Large",
        message: "The invoice XML file must be 5 MB or smaller.",
      });
    }
    chunks.push(bytes);
  }

  if (size === 0) {
    throw createError({
      status: 400,
      statusText: "Bad Request",
      message: "An invoice XML document is required.",
    });
  }

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(
      Buffer.concat(chunks),
    );
  } catch {
    throw createError({
      status: 400,
      statusText: "Bad Request",
      message: "The invoice XML must use UTF-8 encoding.",
    });
  }
}

function parseManualAmount(value: unknown): string | null {
  let amountText: string;

  if (typeof value === "number") {
    if (
      !Number.isFinite(value) ||
      value < 0.01 ||
      value > 99_999_999.99 ||
      Number(value.toFixed(2)) !== value
    ) {
      return null;
    }

    amountText = value.toFixed(2);
  } else if (typeof value === "string") {
    amountText = value.trim().replace(",", ".");
    if (!/^\d+(?:\.\d{2})?$/.test(amountText)) return null;
    if (!amountText.includes(".")) amountText += ".00";
  } else {
    return null;
  }

  const decimalPoint = amountText.indexOf(".");
  const wholeAmount = amountText
    .slice(0, decimalPoint)
    .replace(/^0+(?=\d)/, "");
  if (wholeAmount.length > 8 || Number(amountText) < 0.01) return null;

  return `${wholeAmount}.${amountText.slice(decimalPoint + 1)}`;
}
