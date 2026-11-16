import type { StoredRecommendation } from '../../../issues/services/issueService';
import type { RecommendationEvent } from '../../../recommendations/services/recommendationService';
import RecommendationHistory from '../../../recommendations/components/RecommendationHistory';

interface ApprovalTrailProps {
  recommendation: StoredRecommendation;
  events: RecommendationEvent[];
}

// The submissions and decisions on this recommendation, oldest first.
function ApprovalTrail({ recommendation, events }: ApprovalTrailProps) {
  const trail = events.filter((event) =>
    ['marked-done', 'approved', 'rejected'].includes(event.action)
  );

  return (
    <section className="form-card">
      <h2 className="form-section-title">Approval trail</h2>
      <RecommendationHistory
        recommendation={recommendation}
        events={trail}
        showLogged={false}
        emptyText="No submissions or decisions yet."
      />
    </section>
  );
}

export default ApprovalTrail;
