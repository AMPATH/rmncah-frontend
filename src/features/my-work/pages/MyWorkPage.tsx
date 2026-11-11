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
      <SummaryCards />
      <RecommendationsTable recommendations={recommendations} />

      <div className="form-actions page-bottom-actions">
        <Button onClick={() => navigate('/issues/new')}>Log issue</Button>
      </div>
    </div>
  );
}

export default MyWorkPage;
