import { apiGet, apiPatch, apiPost } from '../../../api/apiClient';
import type { NewIssue, StoredIssue, StoredRecommendation } from './issueService';
import { cancelRecommendation } from '../../recommendations/services/recommendationService';

export const editableIssueFields = {
  dateOfBirth: 'Date of birth',
  gender: 'Gender',
  causeOfDeath: 'Cause of death',
  periodOfDeath: 'Period of death',
  gestationWeeks: 'Gestation (weeks)',
  daysPostpartum: 'Days postpartum',
  dateOfDeath: 'Date of death',
  dateOfNotification: 'Date of notification',
  dateOfAudit: 'Date of audit',
  contributingFactors: 'Contributing factors',
  comments: 'Comments',
} as const;

export type EditableIssueField = keyof typeof editableIssueFields;
export type IssueChanges = Pick<NewIssue, EditableIssueField>;

export interface IssueFieldChange {
  field: string;
  from: string;
  to: string;
}

export interface IssueEvent {
  id: string;
  issueCode: string;
  at: string;
  byUserId: string;
  action: 'edited' | 'cancelled';
  note: string;
  changes: IssueFieldChange[];
}

function asText(value: string | string[]): string {
  return Array.isArray(value) ? value.join('; ') : value;
}

export function issueDifferences(issue: StoredIssue, changes: IssueChanges): IssueFieldChange[] {
  return (Object.keys(editableIssueFields) as EditableIssueField[])
    .filter((field) => asText(issue[field] ?? '') !== asText(changes[field] ?? ''))
    .map((field) => ({
      field: editableIssueFields[field],
      from: asText(issue[field] ?? '') || '—',
      to: asText(changes[field] ?? '') || '—',
    }));
}

export function getIssueEvents(issueCode: string): Promise<IssueEvent[]> {
  return apiGet<IssueEvent[]>('/issueEvents', { issueCode });
}

async function recordIssueEvent(event: Omit<IssueEvent, 'id' | 'at'>): Promise<void> {
  await apiPost<IssueEvent>('/issueEvents', { ...event, at: new Date().toISOString() });
}

export async function editIssue(
  issue: StoredIssue,
  byUserId: string,
  changes: IssueChanges,
  reason: string
): Promise<StoredIssue> {
  const differences = issueDifferences(issue, changes);
  const updated = await apiPatch<StoredIssue>(`/issues/${issue.id}`, changes);
  await recordIssueEvent({ issueCode: issue.code, byUserId, action: 'edited', note: reason, changes: differences });
  return updated;
}

export async function cancelIssue(
  issue: StoredIssue,
  byUserId: string,
  reason: string,
  recommendations: StoredRecommendation[]
): Promise<StoredIssue> {
  const updated = await apiPatch<StoredIssue>(`/issues/${issue.id}`, { cancelled: true, cancelReason: reason });
  await recordIssueEvent({ issueCode: issue.code, byUserId, action: 'cancelled', note: reason, changes: [] });

  const running = recommendations.filter(
    (recommendation) => recommendation.status !== 'Closed' && recommendation.status !== 'Cancelled'
  );
  for (const recommendation of running) {
    await cancelRecommendation(recommendation, byUserId, `Issue ${issue.code} cancelled: ${reason}`);
  }
  return updated;
}
