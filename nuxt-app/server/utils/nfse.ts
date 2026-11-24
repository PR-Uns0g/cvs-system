import * as tx from "fast-typed-xml";

const nfseSchema = tx.object({
  ListaNfse: tx.object("ListaNfse", {
    CompNfse: tx.object("CompNfse", {
      NFSe: tx.object("NFSe", {
        infNFSe: tx.object("infNFSe", {
          externalId: tx.string("Id", "attribute"),
          number: tx.string("nNFSe", "element"),
          values: tx.object("valores", {
            netAmount: tx.string("vLiq", "element"),
            issRate: tx.string("pAliqAplic", "element"),
            issAmount: tx.string("vISSQN", "element"),
          }),
          ibsCbs: tx.object("IBSCBS", {
            values: tx.object("valores", {
              mun: tx.object("mun", {
                rate: tx.string("pAliqEfetMun", "element"),
              }),
              uf: tx.object("uf", {
                rate: tx.string("pAliqEfetUF", "element"),
              }),
              fed: tx.object("fed", {
                rate: tx.string("pAliqEfetCBS", "element"),
              }),
            }),
            totals: tx.object("totCIBS", {
              ibs: tx.object("gIBS", {
                mun: tx.object("gIBSMunTot", {
                  amount: tx.string("vIBSMun", "element"),
                }),
                uf: tx.object("gIBSUFTot", {
                  amount: tx.string("vIBSUF", "element"),
                }),
              }),
              fed: tx.object("gCBS", {
                amount: tx.string("vCBS", "element"),
              }),
            }),
          }),
          dps: tx.object("DPS", {
            info: tx.object("infDPS", {
              issuedAt: tx.string("dhEmi", "element"),
              occuredAt: tx.string("dCompet", "element"),
              series: tx.string("serie", "element"),
              contractor: tx.object("toma", {
                cnpj: tx.string("CNPJ", "element", true),
                legalName: tx.string("xNome", "element"),
                email: tx.string("email", "element", true),
                phone: tx.string("fone", "element", true),
              }),
              service: tx.object("serv", {
                details: tx.object("cServ", {
                  description: tx.string("xDescServ", "element"),
                }),
              }),
            }),
          }),
        }),
      }),
    }),
  }),
});

export class NfseExtractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NfseExtractionError";
  }
}

export function extractNfseData(xml: string) {
  let parsed: tx.Infer<typeof nfseSchema>;
  try {
    parsed = nfseSchema.parse(xml);
  } catch (error) {
    if (error instanceof tx.ParseError || error instanceof tx.InvalidInputError) {
      throw new NfseExtractionError(
        "The XML is invalid or is missing required NFSe fields.",
      );
    }

    throw error;
  }

  const invoice = parsed.ListaNfse.CompNfse.NFSe.infNFSe;
  const contractor = invoice.dps.info.contractor;
  const rawDocument = contractor.cnpj?.trim();
  if (!rawDocument) {
    throw new NfseExtractionError("The contractor must have a CNPJ.");
  }

  const document = rawDocument.replace(/\D/g, "");
  if (!/^(?:\d{14})$/.test(document)) {
    throw new NfseExtractionError("The contractor document is invalid.");
  }

  const legalName = contractor.legalName.trim();
  if (!legalName) {
    throw new NfseExtractionError("The contractor name is missing.");
  }

  const invoiceExternalId = invoice.externalId.trim();
  if (!invoiceExternalId) {
    throw new NfseExtractionError("The NFSe external ID is missing.");
  }

  const amount = validateDecimal(invoice.values.netAmount, "vLiq", 10, 2);
  const issRate = validateDecimal(invoice.values.issRate, "pAliqAplic", 5, 2);
  const issAmount = validateDecimal(invoice.values.issAmount, "vISSQN", 10, 2);

  return {
    financialRecord: {
      amount,
      description: invoice.dps.info.service.details.description.trim(),
    },
    contractor: {
      document,
      legalName,
      email: contractor.email?.trim() || null,
      phone: contractor.phone?.trim() || null,
    },
    invoiceMetadata: {
      invoiceExternalId,
      issuedAt: parseDateTime(invoice.dps.info.issuedAt, "dhEmi"),
      occuredAt: parseDateOnly(invoice.dps.info.occuredAt, "dCompet"),
      issRate,
      issAmount,
      taxes: {
        ibs: {
          mun: {
            rate: validateXmlDecimal(
              invoice.ibsCbs.values.mun.rate,
              "pAliqEfetMun",
            ),
            amount: validateXmlDecimal(
              invoice.ibsCbs.totals.ibs.mun.amount,
              "vIBSMun",
            ),
          },
          uf: {
            rate: validateXmlDecimal(
              invoice.ibsCbs.values.uf.rate,
              "pAliqEfetUF",
            ),
            amount: validateXmlDecimal(
              invoice.ibsCbs.totals.ibs.uf.amount,
              "vIBSUF",
            ),
          },
          fed: {
            rate: validateXmlDecimal(
              invoice.ibsCbs.values.fed.rate,
              "pAliqEfetCBS",
            ),
            amount: validateXmlDecimal(
              invoice.ibsCbs.totals.fed.amount,
              "vCBS",
            ),
          },
        },
      },
      extra: {
        series: invoice.dps.info.series.trim(),
        number: invoice.number.trim(),
      },
    },
  };
}

function validateDecimal(
  value: string,
  field: string,
  precision: number,
  scale: number,
): string {
  const decimal = validateXmlDecimal(value, field);
  const [whole = "", fraction = ""] = decimal.replace(/^-/, "").split(".");
  const significantWholeDigits = whole.replace(/^0+/, "").length;

  if (significantWholeDigits > precision - scale || fraction.length > scale) {
    throw new NfseExtractionError(
      `${field} exceeds the supported decimal precision.`,
    );
  }

  return decimal;
}

function validateXmlDecimal(value: string, field: string): string {
  const decimal = value.trim();
  if (!/^-?\d+(?:\.\d+)?$/.test(decimal)) {
    throw new NfseExtractionError(`${field} is not a valid decimal value.`);
  }

  return decimal;
}

function parseDateTime(value: string, field: string): Date {
  const datePart = value.slice(0, 10);
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(
      value,
    ) ||
    !isValidCalendarDate(datePart)
  ) {
    throw new NfseExtractionError(`${field} is not a valid date and time.`);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new NfseExtractionError(`${field} is not a valid date and time.`);
  }

  return date;
}

function parseDateOnly(value: string, field: string): Date {
  if (!isValidCalendarDate(value)) {
    throw new NfseExtractionError(`${field} is not a valid date.`);
  }

  return new Date(`${value}T00:00:00.000Z`);
}

function isValidCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}
