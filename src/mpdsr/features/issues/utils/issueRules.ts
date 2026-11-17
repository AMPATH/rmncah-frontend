import type { User } from '../types/issue.types';
import type { StoredIssue, StoredRecommendation } from '../services/issueService';
import { can } from '../../../auth/permissions';
import { daysBetween } from '../../../utils/dates';

// The person who logged an issue may correct it for this many days; after that only the chair.
export const LOGGER_EDIT_DAYS = 7;

// Why the user can't edit or cancel this issue, or '' when they can.
// The backend checks the same rules again.
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
    return isChair ? '' : 'Only the facility MPDSR chair can cancel an issue.';
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
