// The three levels of delay. Their factors come from the backend (GET /api/contributing-factors).
export interface DelayLevelInfo {
  id: string;
  title: string;
}

export interface DelayLevel extends DelayLevelInfo {
  factors: string[];
}

export const delayLevels: DelayLevelInfo[] = [
  { id: '1st', title: 'Personal or family' },
  { id: '2nd', title: 'Access to skilled attendance' },
  { id: '3rd', title: 'Quality of care' },
];
