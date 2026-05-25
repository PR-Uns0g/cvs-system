import { upstreamRoutes } from "../../utils/api-routes";
import { buildLaunchesReportCsv } from "../../utils/report-csv";
import { unwrapUpstreamList } from "../../utils/upstream-list";
import { upstreamFetch } from "../../utils/upstream-fetch";

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

  const [launchesRaw, contractorsRaw] = await Promise.all([
    upstreamFetch<unknown>(event, upstreamRoutes.launches),
    upstreamFetch<unknown>(event, upstreamRoutes.contractors),
  ]);

  const csv = buildLaunchesReportCsv({
    launches: unwrapUpstreamList(launchesRaw),
    contractors: unwrapUpstreamList(contractorsRaw),
    periodStart: dataInicial,
    periodEnd: dataFinal,
    contractorIds: contratantesFilter,
    fields: campos,
  });

  const bom = "\uFEFF";

  setHeader(event, "content-type", "text/csv; charset=utf-8");
  setHeader(
    event,
    "content-disposition",
    `attachment; filename="relatorio-cvs-${dataInicial || "inicio"}-${dataFinal || "fim"}.csv"`,
  );

  return bom + csv;
});
