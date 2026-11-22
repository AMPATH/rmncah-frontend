import type { StoredIssue } from '../services/issueService';

export interface DuplicateCheck {
  issueType: string;
  loggedAt: string;
  dateOfDeath: string;
  dateOfNotification: string;
}

// Same place, same type and the same date of death (or date of notification for a near miss).
export function findDuplicates(issues: StoredIssue[], draft: DuplicateCheck): StoredIssue[] {
  const isDeath = draft.issueType !== 'near-miss';
  const date = isDeath ? draft.dateOfDeath : draft.dateOfNotification;
  if (!draft.issueType || !draft.loggedAt || !date) return [];

  return issues.filter(
    (issue) =>
      issue.cancelled !== true &&
      issue.issueType === draft.issueType &&
      issue.loggedAt === draft.loggedAt &&
      (isDeath ? issue.dateOfDeath : issue.dateOfNotification) === date
  );
}