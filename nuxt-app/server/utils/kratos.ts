import type { FetchOptions, FetchResponse } from "ofetch";

export async function fetchKratos<T>(
  baseUrl: string,
  path: string,
  options: FetchOptions<"json"> = {},
): Promise<FetchResponse<T>> {
  try {
    return await $fetch.raw<T>(new URL(path, baseUrl).toString(), {
      ...options,
      ignoreResponseError: true,
    });
  } catch (cause) {
    throw createError({
      statusCode: 502,
      statusMessage: "The authentication service is unavailable.",
      cause,
    });
  }
}
