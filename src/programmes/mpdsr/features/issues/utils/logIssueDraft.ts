import type { IssueType, Setting } from '../types/issue.types';

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
  // One recommendation for each level of delay, keyed by delay (1st, 2nd, 3rd).
  recommendationTexts?: Record<string, string>;
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
  }
}

export function clearDraft(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
  }
}
