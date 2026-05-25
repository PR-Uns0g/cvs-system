import { upstreamRoutes } from "../../utils/api-routes";
import { upstreamFetch } from "../../utils/upstream-fetch";
import { unwrapUpstreamList } from "../../utils/upstream-list";

export default defineEventHandler(async (event) => {
  const payload = await upstreamFetch<unknown>(event, upstreamRoutes.launches, {
    query: getQuery(event),
  });

  return unwrapUpstreamList(payload);
});
