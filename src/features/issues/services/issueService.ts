import { apiGet, apiPost } from '../../../services/apiClient';
import type { AppNotification } from '../../notifications/types/notification.types';
import type {
  DraftRecommendation,
  IssueType,
  Recommendation,
  RecommendationStatus,
  Setting,
} from '../types/issue.types';

// The issue as the Log issue form sends it.
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
}

// The issue as stored: the server adds the id, the readable code and the date logged.
export interface StoredIssue extends NewIssue {
  id: string;
  code: string;
  dateLogged: string;
}

// A recommendation as stored.
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

export function getStoredRecommendations(): Promise<StoredRecommendation[]> {
  return apiGet<StoredRecommendation[]>('/recommendations');
}


// Sub-county and county recommendations wait for acceptance; the others start as Open.
function needsAcceptance(recommendation: DraftRecommendation) {
  return recommendation.level === 'sub-county' || recommendation.level === 'county';
}

// Saves the issue, then each recommendation, then a notification for each recommendation.
// For now the frontend makes the codes; the real backend will do this in one transaction.
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

    await apiPost<AppNotification>('/notifications', {
      date: today,
      message: acceptance
        ? 'New recommendation needs your acceptance within 3 days'
        : 'New recommendation assigned to you',
      recommendationId: code,
      from: 'System',
      category: acceptance ? 'acceptance-needed' : 'assigned',
      read: false,
    });
  }

  return savedIssue;
}

// One row of the Action plan table. The readable code (ISS-2026-0001-R1) is used as the row id.
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
