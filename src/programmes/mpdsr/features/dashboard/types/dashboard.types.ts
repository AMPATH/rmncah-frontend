export interface DashboardFilterValues {
  county: string;
  subCounty: string;
  facility: string;
  issueType: string;
  setting: string;
  period: string;
}

export interface StatRow {
  label: string;
  value: string | number;
}
