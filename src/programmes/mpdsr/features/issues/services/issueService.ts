import { apiGet, apiPost } from '../../../api/apiClient';
import type { AppNotification } from '../../notifications/types/notification.types';
import { markOverdue } from '../../recommendations/services/recommendationService';
import { acceptanceDeadline } from '../../recommendations/services/escalationMatrix';
import type {
  DraftRecommendation,
  IssueType,
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

function needsAcceptance(recommendation: DraftRecommendation) {
  return recommendation.level === 'sub-county' || recommendation.level === 'county';
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

  for (const [index, draft] of drafts.entries()) {
    const code = `${issueCode}-R${index + 1}`;
    const acceptance = needsAcceptance(draft);

    await apiPost<StoredRecommendation>('/recommendations', {
      ...draft,
      code,
      issueId: savedIssue.id,
      issueCode,
      dueDate: draft.dateOfCompletion,
      status: acceptance ? 'Pending acceptance' : 'Open',
      timesRedone: 0,
      dateLogged: today,
    });

    if (!draft.responsiblePersonId) {
      continue;
    }

    await apiPost<AppNotification>('/notifications', {
      recipientId: draft.responsiblePersonId,
      date: today,
      at: new Date().toISOString(),
      message: acceptance
        ? `New recommendation needs your acceptance within ${await acceptanceDeadline(draft.level)}`
        : 'New recommendation assigned to you',
      recommendationId: code,
      from: 'System',
      category: acceptance ? 'acceptance-needed' : 'assigned',
      read: false,
    });
  }

  return savedIssue;
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
