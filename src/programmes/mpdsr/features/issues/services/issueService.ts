import { apiGet, apiPost } from '../../../api/apiClient';
import { placesWithin } from '../../../auth/locations';
import type { Location } from '../../../auth/locations';
import type { IssueReview } from '../utils/caseReview';
import type { AppNotification } from '../../notifications/types/notification.types';
import { markOverdue } from '../../recommendations/services/recommendationService';
import type {
  DraftRecommendation,
  IssueType,
  User,
  Recommendation,
  RecommendationStatus,
  Setting,
} from '../types/issue.types';

export interface NewIssue {
  setting: Setting | '';
  loggedAt: string;
  issueType: IssueType | '';
  dateOfBirth: string;
  gender: string;
  causeOfDeath: string;
  periodOfDeath: string;
  gestationWeeks: string;
  daysPostpartum: string;
  dateOfDeath: string;
  dateOfNotification: string;
  dateOfAudit: string;
  contributingFactors: string[];
  comments: string;
  loggedById?: string;
}

export interface StoredIssue extends NewIssue {
  id: string;
  code: string;
  dateLogged: string;
  cancelled?: boolean;
  cancelReason?: string;
  review?: IssueReview;
}

export interface StoredRecommendation extends DraftRecommendation {
  id: string;
  code: string;
  issueId: string;
  issueCode: string;
  dueDate: string;
  status: RecommendationStatus;
  timesRedone: number;
  dateLogged: string;
}

export function getIssues(): Promise<StoredIssue[]> {
  return apiGet<StoredIssue[]>('/issues');
}

export async function getStoredRecommendations(): Promise<StoredRecommendation[]> {
  const recommendations = await apiGet<StoredRecommendation[]>('/recommendations');
  return markOverdue(recommendations);
}

export async function createIssueWithRecommendations(
  issue: NewIssue,
  drafts: DraftRecommendation[],
  today: string
): Promise<StoredIssue> {
  const existing = await getIssues();
  const year = today.slice(0, 4);
  const sequence = String(existing.length + 1).padStart(4, '0');
  const issueCode = `ISS-${year}-${sequence}`;

  const savedIssue = await apiPost<StoredIssue>('/issues', {
    ...issue,
    code: issueCode,
    dateLogged: today,
  });

  await notifyChairsToReview(savedIssue, today);

  for (const [index, draft] of drafts.entries()) {
    const code = `${issueCode}-R${index + 1}`;

    await apiPost<StoredRecommendation>('/recommendations', {
      ...draft,
      code,
      issueId: savedIssue.id,
      issueCode,
      dueDate: draft.dateOfCompletion,
      status: 'Pending review',
      timesRedone: 0,
      dateLogged: today,
    });
  }

  return savedIssue;
}

async function notifyChairsToReview(issue: StoredIssue, today: string) {
  try {
    const [users, locations] = await Promise.all([apiGet<User[]>('/users'), apiGet<Location[]>('/locations')]);
    const chairs = users.filter(
      (user) =>
        user.role === 'FACILITY_CHAIR' &&
        user.active !== false &&
        user.deleted !== true &&
        placesWithin(user.assignedLocations, locations).has(issue.loggedAt)
    );
    for (const chair of chairs) {
      await apiPost<AppNotification>('/notifications', {
        recipientId: chair.id,
        date: today,
        at: new Date().toISOString(),
        message: `New issue ${issue.code} needs your case review`,
        recommendationId: issue.code,
        from: 'System',
        category: 'review-needed',
        read: false,
      });
    }
  } catch {
    return;
  }
}

export function toTableRow(recommendation: StoredRecommendation): Recommendation {
  return {
    id: recommendation.code,
    issueId: recommendation.issueCode,
    text: recommendation.text,
    level: recommendation.level,
    dueDate: recommendation.dueDate,
    status: recommendation.status,
    timesRedone: recommendation.timesRedone,
  };
}

export async function getRecommendations(): Promise<Recommendation[]> {
  const stored = await getStoredRecommendations();
  return stored.map(toTableRow);
}
