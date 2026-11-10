import { useNavigate } from 'react-router';
import { Button } from '@carbon/react';
import type { Recommendation } from '../../issues/types/issue.types';
import RecommendationsTable from '../components/RecommendationsTable';
import SummaryCards from '../components/SummaryCards';

function MyWorkPage() {
  const navigate = useNavigate();
  const recommendations: Recommendation[] = [];

  return (
    <div className="page">
      <div className="page-header">
        <h1>My work</h1>
        <Button
          kind="tertiary"
          onClick={() => navigate('/issues/new')}
        >
          Log issue
        </Button>
      </div>

      <SummaryCards />
      <RecommendationsTable recommendations={recommendations} />
    </div>
  );
}

export default MyWorkPage;
