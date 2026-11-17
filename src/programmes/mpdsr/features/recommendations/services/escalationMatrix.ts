import { apiGet, apiPatch } from '../../../api/apiClient';
import type { Level } from '../../issues/types/issue.types';

// How many days the responsible person has to accept a recommendation, per level.
// Set by the admin (Admin → Escalation matrix). After that, it goes to the PCN coordinator.
export type EscalationMatrix = Record<Level, number>;

// Used until the admin changes it, or if it can't be loaded.
export const defaultEscalationMatrix: EscalationMatrix = {
  community: 3,
  facility: 3,
  'sub-county': 3,
  county: 3,
};

// GET /escalation-matrix (json-server: /escalationMatrix)
export async function getEscalationMatrix(): Promise<EscalationMatrix> {
  try {
    const matrix = await apiGet<Partial<EscalationMatrix>>('/escalationMatrix');
    return { ...defaultEscalationMatrix, ...matrix };
  } catch {
    return defaultEscalationMatrix;
  }
}

// PATCH /escalation-matrix (admin)
export function saveEscalationMatrix(matrix: EscalationMatrix): Promise<EscalationMatrix> {
  return apiPatch<EscalationMatrix>('/escalationMatrix', matrix);
}

// "3 days" / "1 day"
export function daysText(days: number): string {
  return days === 1 ? '1 day' : `${days} days`;
}

// The acceptance deadline for one level, for messages such as notifications.
export async function acceptanceDeadline(level: Level): Promise<string> {
  const matrix = await getEscalationMatrix();
  return daysText(matrix[level]);
}
