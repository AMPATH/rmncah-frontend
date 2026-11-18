import type { Role } from '../auth/permissions';
import type {
  Classification,
  IssueType,
  Level,
  RecommendationStatus,
  Setting,
} from '../features/issues/types/issue.types';

export type IsoDate = string;
export type IsoDateTime = string;

export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

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
  active: boolean;
  deleted: boolean;
  deletedAt?: IsoDateTime;
  deletedById?: string;
  deleteReason?: string;
}

export interface SaveUserRequest {
  fullName: string;
  cadre: string;
  email: string;
  role: Role;
  locationIds: string[];
}

export type LocationType = 'county' | 'sub-county' | 'facility' | 'community-unit';

export interface LocationDto {
  id: string;
  name: string;
  type: LocationType;
  parentId: string | null;
}

export interface CreateLocationRequest {
  name: string;
  type: LocationType;
  parentId: string | null;
}

export interface ReferenceItemDto {
  id: string;
  code?: string;
  label: string;
 
  delayLevel?: string;
}

export interface CreateRecommendationRequest {
  gap: string;
  responsiblePersonId: string;
  text: string;
  classification: Classification;
  level: Level;
  dateOfCompletion: IsoDate;
}

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

export type AddRecommendationRequest = CreateRecommendationRequest;

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
  | 'marked-overdue'
  | 'edited'
  | 'cancelled';

export interface RecommendationEventDto {
  id: string;
  at: IsoDateTime;
  action: RecommendationAction;
  byUserId: string | null;
  byUserName: string;
  fromStatus: RecommendationStatus;
  toStatus: RecommendationStatus;
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

export type EscalationMatrixDto = Record<Level, number>;

export interface NotificationDto {
  id: string;
  at: IsoDateTime;
  message: string;
  recommendationId: string;
  recommendationCode: string;
  from: string;
  category: NotificationCategory;
  read: boolean;
}

export type NotificationCategory =
  | 'assigned'
  | 'acceptance-needed'
  | 'reminder'
  | 'escalated'
  | 'overdue'
  | 'approval-needed'
  | 'approved'
  | 'rejected'
  | 'cancelled';

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
  recommendationsByClassification: Record<Classification, number>;
  recommendationsByLevel: Record<Level, number>;
  performance: {
    
    averageDaysToAcceptance: number | null;
    acceptedCount: number;
    
    closedOnTime: number;
    closedCount: number;
    redoneCount: number;
    redoneTimes: number;
  };
  byPlace: PlaceFiguresDto[];
}

export interface PlaceFiguresDto {
  locationId: string;
  locationName: string;
  issues: number;
  recommendations: number;
  stillRunning: number;
  overdue: number;
  closed: number;
}
