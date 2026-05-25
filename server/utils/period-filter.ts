const toDate = (iso: unknown): Date | null => {
  if (typeof iso !== "string" || !iso) {
    return null;
  }
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
};

const dateKey = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const launchDateIso = (record: Record<string, unknown>) =>
  record.data_emissao ?? record.data_lancamento ?? record.data;

export const inPeriodRange = (
  record: Record<string, unknown>,
  periodStart: string,
  periodEnd: string,
): boolean => {
  if (!periodStart || !periodEnd) {
    return true;
  }

  const d = toDate(launchDateIso(record));
  if (!d) {
    return true;
  }

  const key = dateKey(d);
  return key >= periodStart && key <= periodEnd;
};

export const filterLaunchesByPeriod = (
  records: Record<string, unknown>[],
  periodStart?: string,
  periodEnd?: string,
) => {
  const start = String(periodStart ?? "").trim();
  const end = String(periodEnd ?? "").trim();

  if (!start || !end) {
    return records;
  }

  return records.filter((row) => inPeriodRange(row, start, end));
};
