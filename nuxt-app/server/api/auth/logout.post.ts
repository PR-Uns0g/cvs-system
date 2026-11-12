import type { KratosLogoutFlow } from "~/types/kratos";
import { fetchKratos } from "~~/server/utils/kratos";

export default defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "private, no-store");

  const config = useRuntimeConfig(event);
  const origin = getRequestHeader(event, "origin");
  if (!origin || origin !== new URL(config.public.appUrl).origin) {
    throw createError({
      status: 403,
      statusText: "Forbidden",
      message: "Logout must be requested from this application.",
    });
  }

  const cookie = getRequestHeader(event, "cookie");
  if (!cookie) {
    return sendRedirect(event, "/auth/login", 303);
  }

  const response = await fetchKratos<KratosLogoutFlow>(
    config.kratosInternalUrl,
    "/self-service/logout/browser",
    { headers: { cookie } },
  );

  if (response.status === 401 || response.status === 403) {
    return sendRedirect(event, "/auth/login", 303);
  }

  const logoutUrlValue = response._data?.logout_url;
  if (response.status !== 200 || !logoutUrlValue) {
    throw createError({
      status: 502,
      statusText: "Bad Gateway",
      message: "Kratos could not start the logout flow.",
    });
  }

  if (!URL.canParse(logoutUrlValue)) {
    throw createError({
      status: 502,
      statusText: "Bad Gateway",
      message: "Kratos returned an invalid logout URL.",
    });
  }

  const logoutUrl = new URL(logoutUrlValue);
  if (
    logoutUrl.origin !== new URL(config.public.kratosBrowserUrl).origin
    || logoutUrl.pathname !== "/self-service/logout"
  ) {
    throw createError({
      status: 502,
      statusText: "Bad Gateway",
      message: "Kratos returned an invalid logout URL.",
    });
  }

  return sendRedirect(event, logoutUrl.toString(), 303);
});
