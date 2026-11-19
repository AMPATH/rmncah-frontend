import { apiGet } from '../../../api/apiClient';
import type { IssueType } from '../types/issue.types';

export interface CauseOfDeath {
  id: string;
  code: string;
  name: string;
  appliesTo: IssueType | 'all';
  active: boolean;
}

export async function getCausesOfDeath(): Promise<CauseOfDeath[]> {
  try {
    return await apiGet<CauseOfDeath[]>('/causesOfDeath');
  } catch {
    return [];
  }
}

export function causeLabel(cause: CauseOfDeath) {
  return cause.code ? `${cause.code} · ${cause.name}` : cause.name;
}

export function causeOptionsFor(causes: CauseOfDeath[], issueType: IssueType | '') {
  return causes
    .filter((cause) => cause.active && (cause.appliesTo === 'all' || cause.appliesTo === issueType))
    .map(causeLabel)
    .sort((a, b) => a.localeCompare(b));
}
