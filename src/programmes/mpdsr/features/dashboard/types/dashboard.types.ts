// The filters at the top of the dashboard. '' means "all".
export interface DashboardFilterValues {
  county: string;
  subCounty: string;
  facility: string;
  issueType: string;
  setting: string;
  period: string;
}

// One line in a dashboard panel, e.g. "Perinatal: 0".
export interface StatRow {
  label: string;
  value: string | number;
}
