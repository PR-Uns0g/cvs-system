/** Unwrap list payloads from Django REST or similar `{ results: [...] }` shapes. */
export const unwrapUpstreamList = (payload: unknown): Record<string, unknown>[] => {
  if (Array.isArray(payload)) {
    return payload as Record<string, unknown>[];
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const list = record.results || record.data || record.items || record.lancamentos;

    if (Array.isArray(list)) {
      return list as Record<string, unknown>[];
    }
  }

  return [];
};

export const sumImpostosRecord = (imp: unknown): number => {
  if (!imp || typeof imp !== "object" || Array.isArray(imp)) {
    return 0;
  }

  return Object.values(imp as Record<string, unknown>).reduce((acc, v) => {
    const n = Number(String(v).replace(",", "."));
    return acc + (Number.isFinite(n) ? n : 0);
  }, 0);
};
