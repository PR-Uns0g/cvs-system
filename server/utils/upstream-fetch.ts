import type { H3Event } from "h3";
import { getAccessToken } from "./auth-cookies";
import { joinApiUrl, upstreamRoutes } from "./api-routes";
import { refreshUpstreamAccess } from "./refresh-upstream-access";

type FetchOptions = Parameters<typeof $fetch>[1] & {
  authenticated?: boolean;
};

const getBaseUrl = () => useRuntimeConfig().apiBase;

export const upstreamFetch = async <T>(
  event: H3Event,
  path: string,
  options: FetchOptions = {},
): Promise<T> => {
  const { authenticated = true, headers, ...fetchOptions } = options;
  const requestHeaders = new Headers(headers as HeadersInit | undefined);
  let access = authenticated ? getAccessToken(event) : undefined;

  if (authenticated && !access) {
    access = await refreshUpstreamAccess(event) ?? undefined;
  }

  if (authenticated && !access) {
    throw createError({
      statusCode: 401,
      statusMessage: "Sessão expirada. Faça login novamente.",
    });
  }

  if (access) {
    requestHeaders.set("Authorization", `Bearer ${access}`);
  }

  try {
    return await $fetch<T>(joinApiUrl(getBaseUrl(), path), {
      ...fetchOptions,
      headers: requestHeaders,
    });
  } catch (error: unknown) {
    if (
      authenticated &&
      error &&
      typeof error === "object" &&
      "statusCode" in error &&
      error.statusCode === 401
    ) {
      const refreshedAccess = await refreshUpstreamAccess(event);

      if (refreshedAccess) {
        requestHeaders.set("Authorization", `Bearer ${refreshedAccess}`);

        return await $fetch<T>(joinApiUrl(getBaseUrl(), path), {
          ...fetchOptions,
          headers: requestHeaders,
        });
      }
    }

    throw error;
  }
};
