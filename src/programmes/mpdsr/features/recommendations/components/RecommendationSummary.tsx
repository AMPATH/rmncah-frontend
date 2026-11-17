import '../recommendations.scss';
import { Link } from 'react-router';
import StatusTag from '../../../components/shared/StatusTag';
import type { StoredRecommendation } from '../../issues/services/issueService';

// A short card at the top of each action page: which recommendation, and where it stands.
function RecommendationSummary({ recommendation }: { recommendation: StoredRecommendation }) {
  return (
    <section className="form-card recommendation-summary">
      <div className="recommendation-summary__head">
        <Link className="cds--link" to={`/recommendations/${recommendation.code}`}>
          {recommendation.code}
        </Link>
        <StatusTag status={recommendation.status} />
      </div>
      <p className="recommendation-summary__text">{recommendation.text}</p>
    </section>
  );
}

export default RecommendationSummary;
