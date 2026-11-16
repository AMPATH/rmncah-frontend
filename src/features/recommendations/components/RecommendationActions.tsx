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
}

// The next steps for this recommendation. Every button is shown, so users can see the
// whole process, but only the ones that fit their role and the current status are enabled.
function RecommendationActions({ recommendation, user }: RecommendationActionsProps) {
  const navigate = useNavigate();
  const { code } = recommendation;

  const actions: { label: string; to: string; rule: RecommendationAction }[] = [
    { label: 'Accept or escalate', to: `/actions/${code}/respond`, rule: 'accept' },
    { label: 'Mark as done', to: `/actions/${code}/close`, rule: 'markDone' },
    { label: 'Approve or reject', to: `/actions/${code}/close`, rule: 'approve' },
    { label: 'Reassign', to: `/actions/${code}/reassign`, rule: 'reassign' },
  ];

  return (
    <div className="recommendation-actions">
      {actions.map((action) => {
        const blockedBecause = whyBlocked(action.rule, recommendation, user);
        return (
          <div key={action.label} className="recommendation-actions__item">
            <Button
              kind={blockedBecause ? 'tertiary' : 'primary'}
              size="md"
              disabled={blockedBecause !== ''}
              onClick={() => navigate(action.to)}
            >
              {action.label}
            </Button>
            {blockedBecause && <span className="recommendation-actions__why">{blockedBecause}</span>}
          </div>
        );
      })}
    </div>
  );
}

export default RecommendationActions;
