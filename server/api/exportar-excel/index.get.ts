import { upstreamRoutes } from "../../utils/api-routes";
import { sumImpostosRecord, unwrapUpstreamList } from "../../utils/upstream-list";
import { upstreamFetch } from "../../utils/upstream-fetch";

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

const inDateRange = (iso: unknown, start: string, end: string): boolean => {
  const d = toDate(iso);
  if (!d) {
    return true;
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const key = `${y}-${m}-${day}`;
  return key >= start && key <= end;
};

const impostosDetail = (imp: unknown): string => {
  if (!imp || typeof imp !== "object" || Array.isArray(imp)) {
    return "";
  }
  return Object.entries(imp as Record<string, unknown>)
    .map(([k, v]) => `${k}: ${v}`)
    .join("; ");
};

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const dataInicial = String(query.data_inicial ?? "");
  const dataFinal = String(query.data_final ?? "");
  const contratantesFilter = String(query.contratantes ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const campos = String(query.campos ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const wantContractorRevenue =
    campos.length === 0 || campos.includes("contractor-revenue");
  const wantMyRevenue = campos.length === 0 || campos.includes("my-revenue");
  const wantTaxes = campos.length === 0 || campos.includes("taxes");

  const [launchesRaw, contractorsRaw] = await Promise.all([
    upstreamFetch<unknown>(event, upstreamRoutes.launches),
    upstreamFetch<unknown>(event, upstreamRoutes.contractors),
  ]);

  const launches = unwrapUpstreamList(launchesRaw);
  const contractors = unwrapUpstreamList(contractorsRaw);

  const nameById = Object.fromEntries(
    contractors.map((c) => [String(c.id ?? ""), String(c.razao_social ?? "")]),
  );

  const idSet =
    contratantesFilter.length > 0 ? new Set(contratantesFilter) : null;

  const filtered = launches.filter((row) => {
    if (idSet && !idSet.has(String(row.contratante ?? ""))) {
      return false;
    }
    if (dataInicial && dataFinal) {
      return inDateRange(row.data_lancamento, dataInicial, dataFinal);
    }
    return true;
  });

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
    const d = toDate(row.data_lancamento);
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

  const csv = [header.map(escapeCsvCell).join(","), ...lines].join("\r\n");
  const bom = "\uFEFF";

  setHeader(event, "content-type", "text/csv; charset=utf-8");
  setHeader(
    event,
    "content-disposition",
    `attachment; filename="relatorio-cvs-${dataInicial || "inicio"}-${dataFinal || "fim"}.csv"`,
  );

  return bom + csv;
});
