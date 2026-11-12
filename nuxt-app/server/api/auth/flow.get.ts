import type { KratosBrowserFlow } from "~/types/kratos";
import { fetchKratos } from "~~/server/utils/kratos";

const flowIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "private, no-store");

  const query = getQuery(event);
  const flowType = query.type;
  const flowId = query.id;

  if (
    (flowType !== "login" && flowType !== "registration")
    || typeof flowId !== "string"
    || !flowIdPattern.test(flowId)
  ) {
    throw createError({
      status: 400,
      statusText: "Bad Request",
      message: "A valid authentication flow is required.",
    });
  }

  const config = useRuntimeConfig(event);
  const cookie = getRequestHeader(event, "cookie");
  const path = `/self-service/${flowType}/flows?id=${encodeURIComponent(flowId)}`;
  const response = await fetchKratos<KratosBrowserFlow>(
    config.kratosInternalUrl,
    path,
    { headers: cookie ? { cookie } : undefined },
  );

  if (response.status === 404 || response.status === 410) {
    throw createError({
      status: 410,
      statusText: "Gone",
      message: "This authentication flow expired. Start again.",
    });
  }

  if (response.status !== 200 || !response._data) {
    throw createError({
      status: 502,
      statusText: "Bad Gateway",
      message: "Kratos could not load the authentication flow.",
    });
  }

  return response._data;
});
