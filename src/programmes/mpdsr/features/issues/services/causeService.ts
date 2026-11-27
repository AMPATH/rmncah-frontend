import { backendGetAll } from '../../../api/backendApi';
import type { IssueType } from '../types/issue.types';

export interface CauseOfDeath {
  id: string;
  code: string;
  name: string;
  appliesTo: IssueType | 'all';
  active: boolean;
}

// A cause as the backend sends it, from GET /api/icd11-causes.
interface Icd11Cause {
  id: string;
  code: string;
  description: string;
}

async function loadFor(caseType: 'MATERNAL' | 'PERINATAL', appliesTo: IssueType): Promise<CauseOfDeath[]> {
  const causes = await backendGetAll<Icd11Cause>('/icd11-causes', { caseType });
  return causes.map((cause) => ({ id: cause.id, code: cause.code, name: cause.description, appliesTo, active: true }));
}

// The ICD-11 list is long (over 1,100 causes) and does not change, so it is fetched once per page load.
let cached: Promise<CauseOfDeath[]> | null = null;

export function getCausesOfDeath(): Promise<CauseOfDeath[]> {
  if (!cached) {
    cached = Promise.all([loadFor('MATERNAL', 'maternal'), loadFor('PERINATAL', 'perinatal')])
      .then(([maternal, perinatal]) => [...maternal, ...perinatal])
      .catch((error: unknown) => {
        cached = null;
        throw error;
      });
  }
  return cached;
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
