import type { H3Event } from "h3";
import { upstreamFetch } from "./upstream-fetch";

/** Django RelatorioView needs xlsx+json in Accept; json-only breaks binary responses. */
export const SPREADSHEET_ACCEPT =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/json";

export const upstreamFetchSpreadsheet = (
  event: H3Event,
  path: string,
  options: Omit<Parameters<typeof upstreamFetch>[2], "responseType"> = {},
) =>
  upstreamFetch<ArrayBuffer>(event, path, {
    ...options,
    responseType: "arrayBuffer",
    headers: {
      Accept: SPREADSHEET_ACCEPT,
      ...(options.headers as HeadersInit | undefined),
    },
  });
