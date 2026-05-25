import { upstreamRoutes } from "../../utils/api-routes";
import { upstreamFetchSpreadsheet } from "../../utils/upstream-spreadsheet";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const content = await upstreamFetchSpreadsheet(event, upstreamRoutes.reports, {
    method: "POST",
    body,
  });

  setHeader(
    event,
    "content-type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  setHeader(event, "content-disposition", 'attachment; filename="relatorio.xlsx"');

  return Buffer.from(content);
});
