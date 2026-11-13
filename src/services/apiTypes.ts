// The shapes the frontend and backend agree to send each other (see docs/api-contract.md).
// Services use these types; pages use the app's own types. If the backend publishes an
// OpenAPI file, this file can later be generated from it instead of written by hand.
import type { Role } from '../auth/permissions';
import type {
  Classification,
  IssueType,
  Level,
  RecommendationStatus,
  Setting,
} from '../features/issues/types/issue.types';

// Dates are sent as "YYYY-MM-DD" strings, date-times as ISO 8601 ("2026-11-13T09:30:00Z").
export type IsoDate = string;
export type IsoDateTime = string;

// A page of results from a list endpoint (?page=1&pageSize=20).
export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

// ---- Auth and users ----

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserDto;
}

export interface UserDto {
  id: string;
  fullName: string;
  cadre: string;
  email: string;
  role: Role;
  level: Level;
  locationIds: string[];
}

// ---- Places and reference lists ----

export type LocationType = 'county' | 'sub-county' | 'facility' | 'community-unit';

export interface LocationDto {
  id: string;
  name: string;
  type: LocationType;
  parentId: string | null;
}

// One entry in a dropdown list: an ICD-11 cause or a contributing factor.
export interface ReferenceItemDto {
  id: string;
  code?: string;
  label: string;
  // Contributing factors only: '1st' | '2nd' | '3rd'.
  delayLevel?: string;
}

// ---- Issues ----

export interface CreateRecommendationRequest {
  gap: string;
  responsiblePersonId: string;
  text: string;
  classification: Classification;
  level: Level;
  dateOfCompletion: IsoDate;
}

// One request creates the issue and all its recommendations (one transaction on the server).
export interface CreateIssueRequest {
  setting: Setting;
  loggedAtId: string;
  issueType: IssueType;
  dateOfBirth: IsoDate;
  gender: string;
  causeOfDeathId: string | null;
  periodOfDeath: string | null;
  gestationWeeks: number | null;
  daysPostpartum: number | null;
  dateOfDeath: IsoDate | null;
  dateOfNotification: IsoDate;
  contributingFactorIds: string[];
  comments: string;
  recommendations: CreateRecommendationRequest[];
}

export interface IssueDto {
  id: string;
  code: string;
  setting: Setting;
  loggedAtId: string;
  issueType: IssueType;
  dateLogged: IsoDate;
  loggedById: string;
  recommendationIds: string[];
}

// ---- Recommendations ----

export interface RecommendationDto {
  id: string;
  code: string;
  issueId: string;
  issueCode: string;
  text: string;
  gap: string;
  classification: Classification;
  level: Level;
  dueDate: IsoDate;
  status: RecommendationStatus;
  responsiblePersonId: string;
  responsiblePersonName: string;
  timesRedone: number;
  dateLogged: IsoDate;
}

export type RecommendationAction =
  | 'created'
  | 'accepted'
  | 'escalated'
  | 'de-escalated'
  | 'auto-escalated'
  | 'reassigned'
  | 'marked-done'
  | 'approved'
  | 'rejected'
  | 'overdue';

export interface RecommendationEventDto {
  id: string;
  at: IsoDateTime;
  action: RecommendationAction;
  byUserId: string | null;
  byUserName: string;
  note: string;
}

export interface RecommendationDetailDto extends RecommendationDto {
  history: RecommendationEventDto[];
}

export interface RecommendationListQuery {
  status?: RecommendationStatus;
  mine?: boolean;
  page?: number;
  pageSize?: number;
}

export interface EscalateRequest {
  direction: 'escalate' | 'de-escalate';
  targetLevel: Level;
  targetUserId: string;
  reason: string;
}

export interface ReassignRequest {
  userId: string;
  dueDate: IsoDate;
  reason: string;
}

export interface DecisionRequest {
  decision: 'approve' | 'reject';
  reason: string;
}

// ---- Notifications ----

export interface NotificationDto {
  id: string;
  at: IsoDateTime;
  message: string;
  recommendationId: string;
  recommendationCode: string;
  from: string;
  category: string;
  read: boolean;
}

// ---- Reports ----

export interface ReportQuery {
  countyId?: string;
  subCountyId?: string;
  facilityId?: string;
  issueType?: IssueType;
  setting?: Setting;
  from?: IsoDate;
  to?: IsoDate;
}

export interface ReportSummaryDto {
  issuesByType: Record<IssueType, number>;
  recommendationsByStatus: Record<RecommendationStatus, number>;
  needsAction: {
    pendingAcceptance: number;
    pendingApproval: number;
    rejected: number;
    escalated: number;
    dueWithin7Days: number;
    overdue: number;
  };
  performance: {
    averageDaysToAcceptance: number | null;
    completedByDueDatePercent: number | null;
    redoneCount: number;
  };
}
