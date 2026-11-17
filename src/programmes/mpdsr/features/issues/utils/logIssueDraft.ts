import type { DraftRecommendation, IssueType, Setting } from '../types/issue.types';

// Everything typed into Log issue, saved in this browser so a refresh or a dropped
// connection doesn't lose it. One draft per user; it is removed when the issue is
// submitted or the form is cleared.
export interface LogIssueDraft {
  savedAt: string;
  step: number;
  furthestStep: number;
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
  selectedFactors: string[];
  comments: string;
  recommendations: DraftRecommendation[];
}

export function draftKeyFor(userId: string): string {
  return `mpdsr.logIssueDraft.${userId}`;
}

export function loadDraft(key: string): LogIssueDraft | null {
  try {
    const text = localStorage.getItem(key);
    return text ? (JSON.parse(text) as LogIssueDraft) : null;
  } catch {
    return null;
  }
}

export function saveDraft(key: string, draft: LogIssueDraft) {
  try {
    localStorage.setItem(key, JSON.stringify(draft));
  } catch {
    // Storage can be full or blocked; the form still works, it just isn't saved.
  }
}

export function clearDraft(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Nothing to clear.
  }
}
