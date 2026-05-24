import { upstreamRoutes } from "../../utils/api-routes";
import { upstreamFetch } from "../../utils/upstream-fetch";

export default defineEventHandler(async (event) =>
  upstreamFetch(event, upstreamRoutes.manualLaunch, {
    method: "POST",
    body: await readBody(event),
  }),
);
