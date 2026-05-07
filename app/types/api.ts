export type ApiUser = {
  name?: string;
  email?: string;
};

export type Contractor = {
  id: number | string;
  legalName: string;
  document: string;
  email: string;
  phone: string;
};

export type TaxDetail = {
  name: string;
  rate: string;
  value: string;
  /** Parsed tax amount in BRL (for alíquota calculations). */
  valueNumber: number;
};

export type LaunchEntry = {
  id: number | string;
  date: string;
  contractor: string;
  contractorRevenue: string;
  taxesTotal: string;
  taxesTotalNumber: number;
  /** NF / service value in BRL (user earnings on the note). */
  myRevenueNumber: number;
  myRevenue: string;
  status: string;
  statusTone: "success" | "warn" | "danger" | "neutral";
  xmlLabel: string;
  taxes: TaxDetail[];
};

export type DashboardSummary = {
  contractorRevenue: string;
  myRevenue: string;
  commissionRatio: number;
  entriesCount: string;
  updatedAt: string;
};
