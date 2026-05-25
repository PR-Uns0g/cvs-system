import { filterLaunchesByPeriod } from "./period-filter";
import { sumImpostosRecord } from "./upstream-list";

export type ReportFieldId =
  | "contratantes_revenue"
  | "users_revenue"
  | "impostos_amount"
  | "contractor-revenue"
  | "my-revenue"
  | "taxes";

const escapeCsvCell = (value: string) => {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const toDate = (iso: unknown): Date | null => {
  if (typeof iso !== "string" || !iso) {
    return null;
  }
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
};

const impostosDetail = (imp: unknown): string => {
  if (!imp || typeof imp !== "object" || Array.isArray(imp)) {
    return "";
  }
  return Object.entries(imp as Record<string, unknown>)
    .map(([k, v]) => `${k}: ${v}`)
    .join("; ");
};

const normalizeFieldIds = (fields: string[]): ReportFieldId[] =>
  fields.map((field) => field.trim()).filter(Boolean) as ReportFieldId[];

export const buildLaunchesReportCsv = (options: {
  launches: Record<string, unknown>[];
  contractors: Record<string, unknown>[];
  periodStart?: string;
  periodEnd?: string;
  contractorIds?: Array<number | string>;
  fields?: string[];
}): string => {
  const {
    launches,
    contractors,
    periodStart = "",
    periodEnd = "",
    contractorIds = [],
    fields = [],
  } = options;

  const normalizedFields = normalizeFieldIds(fields);
  const wantContractorRevenue =
    normalizedFields.length === 0 ||
    normalizedFields.includes("contratantes_revenue") ||
    normalizedFields.includes("contractor-revenue");
  const wantMyRevenue =
    normalizedFields.length === 0 ||
    normalizedFields.includes("users_revenue") ||
    normalizedFields.includes("my-revenue");
  const wantTaxes =
    normalizedFields.length === 0 ||
    normalizedFields.includes("impostos_amount") ||
    normalizedFields.includes("taxes");

  const nameById = Object.fromEntries(
    contractors.map((c) => [String(c.id ?? ""), String(c.razao_social ?? "")]),
  );

  const idSet =
    contractorIds.length > 0
      ? new Set(contractorIds.map((id) => String(id)))
      : null;

  const filtered = filterLaunchesByPeriod(launches, periodStart, periodEnd).filter(
    (row) => {
      if (!idSet) {
        return true;
      }
      return idSet.has(String(row.contratante ?? ""));
    },
  );

  const header = [
    "ID",
    "Data",
    "Contratante",
    ...(wantContractorRevenue ? ["Faturamento contratante (informado)"] : []),
    ...(wantMyRevenue ? ["Valor NF (XML)"] : []),
    ...(wantTaxes ? ["Total impostos", "Detalhe impostos"] : []),
  ];

  const lines = filtered.map((row) => {
    const id = String(row.id ?? "");
    const d = toDate(row.data_lancamento ?? row.data_emissao ?? row.data);
    const dataStr = d
      ? d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
      : "";
    const cid = String(row.contratante ?? "");
    const cname = nameById[cid] || cid;

    const cells: string[] = [id, dataStr, cname];

    if (wantContractorRevenue) {
      cells.push(String(row.faturamento_contratante ?? ""));
    }
    if (wantMyRevenue) {
      cells.push(String(row.valor_nf ?? ""));
    }
    if (wantTaxes) {
      cells.push(String(sumImpostosRecord(row.impostos)));
      cells.push(impostosDetail(row.impostos));
    }

    return cells.map(escapeCsvCell).join(",");
  });

  return [header.map(escapeCsvCell).join(","), ...lines].join("\r\n");
};
