import { joinApiUrl, upstreamRoutes } from "../../utils/api-routes";
import { upstreamFetch } from "../../utils/upstream-fetch";

export default defineEventHandler((event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Informe o lancamento a remover.",
    });
  }

  return upstreamFetch(event, joinApiUrl(upstreamRoutes.launches, `${encodeURIComponent(id)}/`), {
    method: "DELETE",
  });
});
