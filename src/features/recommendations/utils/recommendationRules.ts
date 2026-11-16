import type { User } from '../../issues/types/issue.types';
import type { StoredRecommendation } from '../../issues/services/issueService';
import { can } from '../../../auth/permissions';

export type RecommendationAction = 'accept' | 'markDone' | 'approve' | 'reassign';

// Why the user can't take this action now, or '' when they can.
// The detail page and the action pages share these rules, so they always agree.
// The backend checks the same rules again; this only keeps the screens honest.
export function whyBlocked(
  action: RecommendationAction,
  recommendation: StoredRecommendation,
  user: User | null
): string {
  const { status } = recommendation;
  const isHolder = user !== null && recommendation.responsiblePersonId === user.id;

  switch (action) {
    case 'accept':
      if (status !== 'Pending acceptance') return 'Only a recommendation waiting for acceptance can be accepted or moved.';
      if (!isHolder || !can(user, 'recommendation.accept')) return 'Only the person it is assigned to can accept or move it.';
      return '';
    case 'markDone':
      if (status !== 'Open' && status !== 'In progress' && status !== 'Overdue') return 'Only open or in-progress work can be marked as done.';
      if (!isHolder || !can(user, 'recommendation.markDone')) return 'Only the person it is assigned to can mark it as done.';
      return '';
    case 'approve':
      if (status !== 'Pending approval') return 'Only work marked as done can be approved or rejected.';
      if (!can(user, 'recommendation.approve')) return 'Only the facility MPDSR chair can approve or reject.';
      return '';
    case 'reassign':
      if (status !== 'Overdue') return 'Only an overdue recommendation can be reassigned.';
      if (!can(user, 'recommendation.reassign')) return 'Only the PCN coordinator can reassign.';
      return '';
  }
}
