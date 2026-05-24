import { upstreamRoutes } from "../../utils/api-routes";
import { upstreamFetch } from "../../utils/upstream-fetch";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const content = await upstreamFetch<ArrayBuffer>(event, upstreamRoutes.reports, {
    method: "POST",
    body,
    responseType: "arrayBuffer",
  });

  setHeader(
    event,
    "content-type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  setHeader(event, "content-disposition", 'attachment; filename="relatorio.xlsx"');

  return content;
});
