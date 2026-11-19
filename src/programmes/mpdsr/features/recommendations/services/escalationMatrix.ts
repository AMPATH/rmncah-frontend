import { apiGet, apiPatch } from '../../../api/apiClient';
import type { Level } from '../../issues/types/issue.types';

export type EscalationMatrix = Record<Level, number>;

export const defaultEscalationMatrix: EscalationMatrix = {
  community: 3,
  facility: 3,
  'sub-county': 3,
  county: 3,
};

export async function getEscalationMatrix(): Promise<EscalationMatrix> {
  try {
    const matrix = await apiGet<Partial<EscalationMatrix>>('/escalationMatrix');
    return { ...defaultEscalationMatrix, ...matrix };
  } catch {
    return defaultEscalationMatrix;
  }
}

export function saveEscalationMatrix(matrix: EscalationMatrix): Promise<EscalationMatrix> {
  return apiPatch<EscalationMatrix>('/escalationMatrix', matrix);
}

export function daysText(days: number): string {
  return days === 1 ? '1 day' : `${days} days`;
}

export async function acceptanceDeadline(level: Level | ''): Promise<string> {
  const matrix = await getEscalationMatrix();
  return daysText(matrix[level === '' ? 'facility' : level]);
}
