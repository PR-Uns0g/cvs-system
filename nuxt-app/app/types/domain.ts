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
  valueNumber: number;
};

export type LaunchEntry = {
  id: number | string;
  date: string;
  contractor: string;
  contractorRevenue: string;
  taxesTotal: string;
  taxesTotalNumber: number;
  myRevenueNumber: number;
  myRevenue: string;
  status: string;
  statusTone: "success" | "warn" | "danger" | "neutral";
  xmlLabel: string;
  taxes: TaxDetail[];
};
