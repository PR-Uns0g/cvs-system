import type { KratosError } from "~/types/kratos";
import { fetchKratos } from "~~/server/utils/kratos";

const errorIdPattern =
  /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|stub:\d{3})$/i;

export default defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "private, no-store");

  const errorId = getQuery(event).id;
  if (typeof errorId !== "string" || !errorIdPattern.test(errorId)) {
    throw createError({
      status: 400,
      statusText: "Bad Request",
      message: "A valid authentication error is required.",
    });
  }

  const config = useRuntimeConfig(event);
  const response = await fetchKratos<KratosError>(
    config.kratosInternalUrl,
    `/self-service/errors?id=${encodeURIComponent(errorId)}`,
  );

  if (response.status === 404 || response.status === 410) {
    throw createError({
      status: 404,
      statusText: "Not Found",
      message: "This authentication error is no longer available.",
    });
  }

  const error = response._data?.error;
  const message = error?.message ?? response._data?.message;
  if (response.status !== 200 || !message) {
    throw createError({
      status: 502,
      statusText: "Bad Gateway",
      message: "Kratos could not load the authentication error.",
    });
  }

  return { message };
});
