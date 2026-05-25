export const readApiErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (!error || typeof error !== "object") {
    return fallback;
  }

  const record = error as Record<string, unknown>;
  const data =
    record.data && typeof record.data === "object"
      ? (record.data as Record<string, unknown>)
      : undefined;

  if (data) {
    const detail = data.detail ?? data.erro ?? data.message;
    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }
  }

  if (typeof record.statusMessage === "string" && record.statusMessage.trim()) {
    return record.statusMessage;
  }

  return fallback;
};
