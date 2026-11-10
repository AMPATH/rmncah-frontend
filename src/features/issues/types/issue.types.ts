
export type Level = 'community' | 'facility' | 'sub-county' | 'county';


export type IssueType = 'perinatal' | 'maternal' | 'near-miss';


export type Setting = 'facility' | 'community';


export type RecommendationStatus =
  | 'Open'
  | 'In progress'
  | 'Pending acceptance'
  | 'Pending approval'
  | 'Overdue'
  | 'Closed';


export interface User {
  id: string;
  fullName: string;
  cadre: string;
  email: string;
  level: Level;
  assignedLocations: string[];
}


export interface Recommendation {
  id: string;
  issueId: string;
  text: string;
  level: Level;
  dueDate: string;
  status: RecommendationStatus;
  timesRedone: number;
}
