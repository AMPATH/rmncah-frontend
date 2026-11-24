import type { Role } from '../../../auth/permissions';

export type Level = 'community' | 'facility' | 'sub-county' | 'county';

export type IssueType = 'perinatal' | 'maternal' | 'near-miss';

export type Setting = 'facility' | 'community';

export type RecommendationStatus =
  | 'Pending review'
  | 'Open'
  | 'In progress'
  | 'Pending acceptance'
  | 'Pending approval'
  | 'Overdue'
  | 'Closed'
  | 'Cancelled';

export interface User {
  id: string;
  fullName: string;
  cadre: string;
  email: string;
  level: Level;
  assignedLocations: string[];
  role: Role;
  active?: boolean;
  deleted?: boolean;
  deletedAt?: string;
  deletedById?: string;
  deleteReason?: string;
}

export interface Recommendation {
  id: string;
  issueId: string;
  text: string;
  level: Level | '';
  dueDate: string;
  status: RecommendationStatus;
  timesRedone: number;
}

export type Classification = 'immediate' | 'intermediate' | 'long-term';

export interface NewRecommendation {
  issueId: string;
  gap: string;
  responsiblePersonId: string;
  text: string;
  // Empty until the facility MPDSR chair sets it at the case review.
  classification: Classification | '';
  level: Level | '';
  dateOfCompletion: string;
}

export type DraftRecommendation = Omit<NewRecommendation, 'issueId'>;
