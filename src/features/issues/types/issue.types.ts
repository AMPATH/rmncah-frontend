// The four levels a user, or a recommendation, can belong to.
export type Level = 'community' | 'facility' | 'sub-county' | 'county';

// The kinds of issue that can be logged.
export type IssueType = 'perinatal' | 'maternal' | 'near-miss';

// Where the issue happened.
export type Setting = 'facility' | 'community';

// Every status a recommendation can be in.
export type RecommendationStatus =
  | 'Open'
  | 'In progress'
  | 'Pending acceptance'
  | 'Pending approval'
  | 'Overdue'
  | 'Closed';

// The person who is signed in.
export interface User {
  id: string;
  fullName: string;
  cadre: string;
  email: string;
  level: Level;
  assignedLocations: string[];
}

// One recommendation, as shown in the My work table.
export interface Recommendation {
  id: string;
  issueId: string;
  text: string;
  level: Level;
  dueDate: string;
  status: RecommendationStatus;
  timesRedone: number;
}

// How urgent a recommendation is. Each one sets the latest completion date.
export type Classification = 'immediate' | 'intermediate' | 'long-term';

// What the Recommendation form will send to the backend.
export interface NewRecommendation {
  issueId: string;
  gap: string;
  responsiblePersonId: string;
  text: string;
  classification: Classification;
  level: Level;
  dateOfCompletion: string;
}

// A recommendation added inside the Log issue form, before the issue has an ID.
export type DraftRecommendation = Omit<NewRecommendation, 'issueId'>;
