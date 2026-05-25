const CONNECTION_ERROR_CODES = new Set([
  "ECONNREFUSED",
  "ENOTFOUND",
  "ETIMEDOUT",
  "ECONNRESET",
]);

export const getConnectionErrorCode = (error: unknown): string | undefined => {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const candidates: unknown[] = [
    "cause" in error ? error.cause : undefined,
    error,
  ];

  for (const candidate of candidates) {
    if (
      candidate &&
      typeof candidate === "object" &&
      "code" in candidate &&
      typeof candidate.code === "string" &&
      CONNECTION_ERROR_CODES.has(candidate.code)
    ) {
      return candidate.code;
    }
  }

  return undefined;
};

export const throwUpstreamUnavailable = (apiBase: string): never => {
  throw createError({
    statusCode: 503,
    statusMessage: "Backend indisponível",
    message: `Não foi possível conectar à API em ${apiBase}. Inicie o servidor Django (porta 8000) antes de usar o sistema.`,
    data: {
      apiBase,
      hint: "No repositório Sistema-Gest-o-Financeira: bash scripts/run_django_server.sh",
    },
  });
};

const parseErrorDataRecord = (data: unknown): Record<string, unknown> | undefined => {
  if (data && typeof data === "object" && !ArrayBuffer.isView(data) && !(data instanceof ArrayBuffer)) {
    return data as Record<string, unknown>;
  }

  if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
    try {
      const bytes = data instanceof ArrayBuffer ? new Uint8Array(data) : new Uint8Array(data.buffer);
      const text = new TextDecoder().decode(bytes).trim();
      if (text.startsWith("{") || text.startsWith("[")) {
        const parsed: unknown = JSON.parse(text);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          return parsed as Record<string, unknown>;
        }
      }
    } catch {
      return undefined;
    }
  }

  return undefined;
};

const readUpstreamErrorMessage = (error: unknown): string | undefined => {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const data = "data" in error ? parseErrorDataRecord(error.data) : undefined;

  if (data) {
    const detail = data.detail ?? data.erro ?? data.message;
    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }

    const fieldErrors = data.fields;
    if (Array.isArray(fieldErrors) && fieldErrors.length) {
      return fieldErrors.map(String).join(" ");
    }
  }

  if ("statusMessage" in error && typeof error.statusMessage === "string") {
    return error.statusMessage;
  }

  return undefined;
};

export const rethrowUpstreamFetchError = (
  error: unknown,
  apiBase: string,
): never => {
  if (getConnectionErrorCode(error)) {
    throwUpstreamUnavailable(apiBase);
  }

  if (
    error &&
    typeof error === "object" &&
    "statusCode" in error &&
    typeof error.statusCode === "number"
  ) {
    const message = readUpstreamErrorMessage(error);

    throw createError({
      statusCode: error.statusCode,
      statusMessage: message || "Erro na API upstream",
      data: "data" in error ? error.data : undefined,
    });
  }

  throw error;
};
