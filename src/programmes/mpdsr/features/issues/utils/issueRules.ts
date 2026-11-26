import type { User } from '../types/issue.types';
import type { StoredIssue, StoredRecommendation } from '../services/issueService';
import { can } from '../../../auth/permissions';
import { daysBetween } from '../../../utils/dates';
import { isReviewed } from './caseReview';

export const LOGGER_EDIT_DAYS = 7;

export function whyIssueBlocked(
  action: 'edit' | 'cancel',
  issue: StoredIssue,
  user: User | null,
  recommendations: StoredRecommendation[],
  today: string
): string {
  if (issue.cancelled) {
    return 'This issue is cancelled.';
  }

  const isChair = can(user, 'recommendation.approve');
  const allFinished =
    recommendations.length > 0 &&
    recommendations.every((recommendation) => recommendation.status === 'Closed' || recommendation.status === 'Cancelled');

  if (action === 'cancel') {
    return 'Issues cannot be cancelled.';
  }

  if (isReviewed(issue)) {
    return 'The case review is complete, so this record is locked.';
  }

  if (isChair) {
    return allFinished ? 'All its recommendations are finished, so the record is final.' : '';
  }

  const isLogger = user !== null && issue.loggedById === user.id;
  if (isLogger) {
    return daysBetween(issue.dateLogged, today) <= LOGGER_EDIT_DAYS
      ? ''
      : `You could edit it for ${LOGGER_EDIT_DAYS} days after logging. Ask the facility MPDSR chair.`;
  }

  return `Only the person who logged it (within ${LOGGER_EDIT_DAYS} days) or the facility MPDSR chair can edit it.`;
}
