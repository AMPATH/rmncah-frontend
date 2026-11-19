import '../recommendations.scss';
import { useNavigate } from 'react-router';
import { Button } from '@carbon/react';
import type { User } from '../../issues/types/issue.types';
import type { StoredRecommendation } from '../../issues/services/issueService';
import { whyBlocked } from '../utils/recommendationRules';
import type { RecommendationAction } from '../utils/recommendationRules';

interface RecommendationActionsProps {
  recommendation: StoredRecommendation;
  user: User | null;
  holderName?: string;
}

function waitingOn(recommendation: StoredRecommendation, holder: string) {
  switch (recommendation.status) {
    case 'Pending review':
      return `Waiting for the facility MPDSR chair to review the case. It goes to ${holder} after that.`;
    case 'Pending acceptance':
      return `Waiting for ${holder} to accept it.`;
    case 'Open':
    case 'In progress':
      return `Waiting for ${holder} to do the work and mark it done.`;
    case 'Overdue':
      return 'Past its due date. Waiting for the PCN coordinator to reassign it.';
    case 'Pending approval':
      return 'Marked done. Waiting for the facility MPDSR chair to approve or reject it.';
    case 'Closed':
      return 'Closed. Nothing more to do.';
    case 'Cancelled':
      return 'Cancelled. Nothing more to do.';
    default:
      return 'Nothing for you to do right now.';
  }
}

function RecommendationActions({ recommendation, user, holderName }: RecommendationActionsProps) {
  const navigate = useNavigate();
  const { code } = recommendation;
  const holder = holderName ?? 'the responsible person';

  const actions: { label: string; to: string; rule: RecommendationAction }[] = [
    { label: 'Accept or escalate', to: `/actions/${code}/respond`, rule: 'accept' },
    { label: 'Mark as done', to: `/actions/${code}/close`, rule: 'markDone' },
    { label: 'Approve or reject', to: `/actions/${code}/close`, rule: 'approve' },
    { label: 'Reassign', to: `/actions/${code}/reassign`, rule: 'reassign' },
    { label: 'Edit', to: `/actions/${code}/edit`, rule: 'edit' },
    { label: 'Cancel recommendation', to: `/actions/${code}/edit`, rule: 'cancel' },
  ];
  const available = actions.filter((action) => whyBlocked(action.rule, recommendation, user) === '');

  if (available.length === 0) {
    return <p className="recommendation-actions__waiting">{waitingOn(recommendation, holder)}</p>;
  }

  return (
    <div className="recommendation-actions recommendation-actions--row">
      {available.map((action, index) => (
        <Button
          key={action.label}
          kind={index === 0 ? 'primary' : action.rule === 'cancel' ? 'danger--tertiary' : 'tertiary'}
          size="md"
          onClick={() => navigate(action.to)}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}

export default RecommendationActions;
