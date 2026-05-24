import type { Contractor, DashboardSummary, LaunchEntry, TaxDetail } from "~/types/api";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Parses API / locale money strings without stripping the decimal dot (e.g. "4835.19"). */
export const parseMoneyNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value !== "string") {
    return null;
  }
  const s = value.trim();
  if (!s) {
    return null;
  }
  const hasComma = s.includes(",");
  const hasDot = s.includes(".");
  if (hasComma && hasDot) {
    const n = Number(s.replace(/\./g, "").replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  if (hasComma && !hasDot) {
    const n = Number(s.replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

export const asArray = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const list = record.results || record.data || record.items || record.lancamentos;

    if (Array.isArray(list)) {
      return list as T[];
    }
  }

  return [];
};

export const formatCurrency = (value: unknown) => {
  const n = parseMoneyNumber(value);
  if (n !== null) {
    return currencyFormatter.format(n);
  }
  if (typeof value === "string" && value.trim() && /^\d/.test(value.trim())) {
    return value.trim();
  }
  return currencyFormatter.format(0);
};

const formatDateTime = (value: string | number) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? String(value)
    : d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
};

const sumImpostosValue = (imp: unknown): number => {
  if (!imp || typeof imp !== "object") {
    return 0;
  }
  if (Array.isArray(imp)) {
    return imp.reduce((acc, row) => {
      const r = row as Record<string, unknown>;
      const n = parseMoneyNumber(r.valor ?? r.value ?? 0) ?? 0;
      return acc + n;
    }, 0);
  }
  return Object.values(imp as Record<string, unknown>).reduce<number>((acc, v) => {
    const n = parseMoneyNumber(v) ?? 0;
    return acc + n;
  }, 0);
};

const taxesFromImpostosObject = (imp: unknown): TaxDetail[] => {
  if (!imp || typeof imp !== "object" || Array.isArray(imp)) {
    return [];
  }
  return Object.entries(imp as Record<string, unknown>).map(([name, val]) => {
    const valueNumber = parseMoneyNumber(val) ?? 0;
    return {
      name,
      rate: "-",
      value: formatCurrency(val),
      valueNumber,
    };
  });
};

const readString = (
  record: Record<string, unknown>,
  keys: string[],
  fallback = "",
) => {
  const value = keys.map((key) => record[key]).find((item) => item);

  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : fallback;
};

/** CNPJ 00.000.000/0000-00; CPF 000.000.000-00 when digit lengths match; otherwise unchanged. */
const formatDocumentoBr = (raw: string): string => {
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "-") {
    return trimmed === "" ? "-" : trimmed;
  }
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 14) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
  }
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  }
  return trimmed;
};

export const normalizeContractor = (item: unknown): Contractor => {
  const record = (item || {}) as Record<string, unknown>;

  return {
    id: readString(record, ["id", "uuid"], crypto.randomUUID()),
    legalName: readString(record, ["legalName", "nome_social", "razao_social", "nome"], "Sem nome"),
    document: formatDocumentoBr(
      readString(record, ["document", "documento", "cpf_cnpj", "cnpj"], "-"),
    ),
    email: readString(record, ["email"], "-"),
    phone: readString(record, ["telefone", "phone"], "-"),
  };
};

const normalizeTaxes = (value: unknown): TaxDetail[] =>
  asArray<Record<string, unknown>>(value).map((tax) => {
    const rawVal = tax.valor ?? tax.value;
    const valueNumber = parseMoneyNumber(rawVal) ?? 0;
    return {
      name: readString(tax, ["nome", "name", "tipo"], "Imposto"),
      rate: readString(tax, ["aliquota", "rate"], "-"),
      value: formatCurrency(rawVal),
      valueNumber,
    };
  });

const statusTone = (status: string): LaunchEntry["statusTone"] => {
  const normalized = status.toLowerCase();

  if (normalized.includes("falha") || normalized.includes("erro")) {
    return "danger";
  }

  if (normalized.includes("pend") || normalized.includes("aguard")) {
    return "warn";
  }

  if (normalized.includes("process") || normalized.includes("confer")) {
    return "success";
  }

  return "neutral";
};

export const readLaunchContractorId = (record: Record<string, unknown>): string | null => {
  const contratanteRaw = record.contratante;

  if (
    contratanteRaw &&
    typeof contratanteRaw === "object" &&
    !Array.isArray(contratanteRaw)
  ) {
    const id = readString(contratanteRaw as Record<string, unknown>, ["id", "uuid"], "");
    return id || null;
  }

  if (contratanteRaw != null && contratanteRaw !== "") {
    return String(contratanteRaw);
  }

  const fallback = record.contratante_id;
  return fallback != null && fallback !== "" ? String(fallback) : null;
};

export const normalizeLaunch = (
  item: unknown,
  contractorNamesById: Record<string, string> = {},
): LaunchEntry => {
  const record = (item || {}) as Record<string, unknown>;
  const status = readString(record, ["status"], "Processado");

  const contratanteRaw = record.contratante;
  let contractor = "Sem contratante";
  if (
    contratanteRaw &&
    typeof contratanteRaw === "object" &&
    !Array.isArray(contratanteRaw) &&
    "razao_social" in contratanteRaw
  ) {
    contractor = readString(contratanteRaw as Record<string, unknown>, ["razao_social"], "Sem contratante");
  } else if (contratanteRaw != null && contratanteRaw !== "") {
    const idKey = String(contratanteRaw);
    contractor = contractorNamesById[idKey] || idKey;
  } else {
    const contractorId = readLaunchContractorId(record);
    if (contractorId) {
      contractor = contractorNamesById[contractorId] || contractorId;
    } else {
      contractor = readString(record, ["contratante_nome", "contractor"], "Sem contratante");
    }
  }

  const rawDate =
    record.data_emissao ??
    record.data_lancamento ??
    record.data ??
    record.date ??
    record.created_at;
  const date =
    typeof rawDate === "string" || typeof rawDate === "number"
      ? formatDateTime(rawDate)
      : "-";

  const impostosVal = record.impostos;
  const taxesList = Array.isArray(impostosVal)
    ? normalizeTaxes(impostosVal)
    : taxesFromImpostosObject(impostosVal);

  const taxesNumeric =
    record.total_impostos !== undefined && record.total_impostos !== null
      ? (parseMoneyNumber(record.total_impostos) ?? 0)
      : sumImpostosValue(impostosVal);

  const taxesTotalNumber = Number.isFinite(taxesNumeric) ? taxesNumeric : 0;
  const myRevenueNumber =
    parseMoneyNumber(
      record.valor_nf ??
        record.users_revenue_total ??
        record.meu_faturamento ??
        record.comissao ??
        record.myRevenue,
    ) ?? 0;

  return {
    id: readString(record, ["id", "uuid"], crypto.randomUUID()),
    date,
    contractor,
    contractorRevenue: formatCurrency(
      record.faturamento_contratante ??
        record.receita_contratante ??
        record.valor_total ??
        record.contractorRevenue,
    ),
    taxesTotal: formatCurrency(taxesTotalNumber),
    taxesTotalNumber,
    myRevenueNumber,
    myRevenue: formatCurrency(
      record.valor_nf ??
        record.users_revenue_total ??
        record.meu_faturamento ??
        record.comissao ??
        record.myRevenue,
    ),
    status,
    statusTone: statusTone(status),
    xmlLabel: readString(record, ["xml", "arquivo", "xmlLabel"], "XML importado"),
    taxes: taxesList.length ? taxesList : normalizeTaxes(record.impostos_detalhes || record.taxes || []),
  };
};

export const normalizeDashboard = (payload: unknown): DashboardSummary => {
  const record = (payload || {}) as Record<string, unknown>;
  const updatedRaw = record.updated_at ?? record.atualizado_em;
  const updatedAt =
    typeof updatedRaw === "string" || typeof updatedRaw === "number"
      ? formatDateTime(updatedRaw)
      : "Agora";

  return {
    contractorRevenue: formatCurrency(
      record.contratantes_revenue_total ||
        record.receita_contratante ||
        record.total_faturamento ||
        record.contractorRevenue,
    ),
    myRevenue: formatCurrency(
      record.users_revenue_total || record.meu_faturamento || record.comissao || record.myRevenue,
    ),
    commissionRatio: Number(
      record.avg_comissao_pct || record.percentual_comissao || record.commissionRatio || 0,
    ),
    entriesCount: readString(
      record,
      ["lancamentos_count", "quantidade_lancamentos", "lancamentos", "entriesCount"],
      "0",
    ),
    updatedAt,
  };
};
