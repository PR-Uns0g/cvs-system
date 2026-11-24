import { db } from "../../prisma/db";
import {
  extractNfseData,
  NfseExtractionError,
} from "../utils/nfse";

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event);
  if (!user) {
    throw createError({
      status: 401,
      statusText: "Unauthorized",
      message: "You must be authenticated to create a new record.",
    });
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
    if (typeof input.xml !== "string" || !input.xml.trim()) {
      throw createError({
        status: 400,
        statusText: "Bad Request",
        message: "An invoice XML document is required.",
      });
    }

    try {
      let nfseData = extractNfseData(input.xml);
      console.log("payloadReceived:", nfseData);
      return nfseData;
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
      message: "amount must be a positive value with at most two decimal places.",
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
      message: "source must be a non-empty string and description must be a string or null.",
    });
  }

  const record = await db.orm.public.FinancialRecord.create({
    ownerId: user.id,
    type: input.type,
    amount,
    direction: input.direction,
    description: typeof description === "string" ? description.trim() || null : null,
    source: source.trim(),
  });

  console.log("Created new record:", record);

  setResponseStatus(event, 201);
  return record;
});

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
