import { upstreamFetch } from "../../utils/upstream-fetch";
import { upstreamRoutes } from "../../utils/api-routes";

export default defineEventHandler((event) =>
  upstreamFetch(event, upstreamRoutes.dashboard, {
    query: getQuery(event),
  }),
);
