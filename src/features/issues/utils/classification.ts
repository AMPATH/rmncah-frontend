import type { Classification } from '../types/issue.types';
import { addMonths } from './dates';

// The longest time each classification allows (from the workflow document).
export const monthsAllowed: Record<Classification, number> = {
  immediate: 1,
  intermediate: 3,
  'long-term': 6,
};

// The latest allowed completion date for a classification, counted from a start date.
export function latestCompletionDate(classification: Classification | '', from: string): string {
  return classification ? addMonths(from, monthsAllowed[classification]) : '';
}
