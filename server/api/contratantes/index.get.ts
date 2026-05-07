import { upstreamRoutes } from "../../utils/api-routes";
import { upstreamFetch } from "../../utils/upstream-fetch";

export default defineEventHandler((event) =>
  upstreamFetch(event, upstreamRoutes.contractors, {
    query: getQuery(event),
  }),
);
