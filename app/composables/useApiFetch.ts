import type { UseFetchOptions } from "#app";

/**
 * Same-origin /api calls with cookies forwarded during SSR (useRequestFetch).
 */
export const useApiFetch = <T>(
  url: string | (() => string),
  options?: UseFetchOptions<T>,
) =>
  useFetch(url, {
    ...options,
    $fetch: useRequestFetch(),
  });
