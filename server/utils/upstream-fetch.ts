import type { H3Event } from "h3";
import { getAccessToken } from "./auth-cookies";
import { joinApiUrl } from "./api-routes";
import { refreshUpstreamAccess } from "./refresh-upstream-access";
import { rethrowUpstreamFetchError } from "./upstream-error";

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

  const apiBase = getBaseUrl();
  const requestUrl = joinApiUrl(apiBase, path);
  const { body, ...restFetchOptions } = fetchOptions;

  if (body instanceof FormData) {
    requestHeaders.delete("content-type");
    requestHeaders.delete("Content-Type");
  }

  try {
    return await $fetch<T>(requestUrl, {
      ...restFetchOptions,
      body,
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

        try {
          return await $fetch<T>(requestUrl, {
            ...restFetchOptions,
            body,
            headers: requestHeaders,
          });
        } catch (retryError: unknown) {
          rethrowUpstreamFetchError(retryError, apiBase);
        }
      }
    }

    rethrowUpstreamFetchError(error, apiBase);
  }
};
