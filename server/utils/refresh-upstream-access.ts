import type { H3Event } from "h3";
import { clearAuthCookies, getRefreshToken, setAuthCookies } from "./auth-cookies";
import { joinApiUrl, upstreamRoutes } from "./api-routes";

/** Exchanges refresh cookie for a new access token at the upstream API. */
export async function refreshUpstreamAccess(event: H3Event): Promise<string | null> {
  const refresh = getRefreshToken(event);

  if (!refresh) {
    return null;
  }

  try {
    const response = await $fetch<{ access?: string; access_token?: string }>(
      joinApiUrl(useRuntimeConfig().apiBase, upstreamRoutes.auth.refresh),
      {
        method: "POST",
        body: { refresh },
      },
    );

    const access = response.access || response.access_token;

    if (!access) {
      clearAuthCookies(event);
      return null;
    }

    setAuthCookies(event, { access });
    return access;
  } catch {
    clearAuthCookies(event);
    return null;
  }
}
