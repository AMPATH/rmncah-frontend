import { DataTableSkeleton } from '@carbon/react';
import { useCurrentUser } from '../../../auth/CurrentUserContext';
import { recommendationsInScope } from '../../../auth/scope';
import { useApiData } from '../../../hooks/useApiData';
import ApiErrorNotice from '../../../components/shared/ApiErrorNotice';
import { getIssues, getStoredRecommendations, toTableRow } from '../../issues/services/issueService';
import type { StoredIssue, StoredRecommendation } from '../../issues/services/issueService';
import RecommendationsTable from '../../my-work/components/RecommendationsTable';

// Page 6: the PCN coordinator's list of overdue recommendations in their places.
// Clicking a code opens the recommendation, where "Reassign" is enabled.
function OverdueListPage() {
  const { currentUser, scope } = useCurrentUser();
  const issuesData = useApiData<StoredIssue[]>(getIssues, []);
  const recommendationsData = useApiData<StoredRecommendation[]>(getStoredRecommendations, []);

  const overdue = recommendationsInScope(recommendationsData.data, issuesData.data, scope, currentUser)
    .filter((recommendation) => recommendation.status === 'Overdue')
    .map(toTableRow);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Overdue and reassign</h1>
      </div>

      {(issuesData.failed || recommendationsData.failed) && <ApiErrorNotice />}

      <p className="form-note">
        A recommendation becomes Overdue when its due date passes before it is done. Open one to
        reassign it to a new person with a new due date.
      </p>

      {issuesData.loading || recommendationsData.loading ? (
        <DataTableSkeleton columnCount={5} rowCount={3} showToolbar={false} />
      ) : overdue.length === 0 ? (
        <p className="empty-note">No overdue recommendations in your places.</p>
      ) : (
        <RecommendationsTable recommendations={overdue} description="Overdue recommendations in your places" />
      )}
    </div>
  );
}

export default OverdueListPage;
