import type { Classification } from '../types/issue.types';
import { addMonths } from '../../../utils/dates';

export const monthsAllowed: Record<Classification, number> = {
  immediate: 1,
  intermediate: 3,
  'long-term': 6,
};

export function latestCompletionDate(classification: Classification | '', from: string): string {
  return classification ? addMonths(from, monthsAllowed[classification]) : '';
}
