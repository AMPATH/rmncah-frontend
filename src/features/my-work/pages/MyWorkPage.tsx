import { useNavigate } from 'react-router';
import { Button, DataTableSkeleton, InlineNotification } from '@carbon/react';
import type { Role } from '../../../auth/permissions';
import { can, roleLabels } from '../../../auth/permissions';
import { useCurrentUser } from '../../../auth/CurrentUserContext';
import { recommendationsInScope } from '../../../auth/scope';
import { getIssues, getStoredRecommendations, toTableRow } from '../../issues/services/issueService';
import type { StoredIssue, StoredRecommendation } from '../../issues/services/issueService';
import { addDays, getToday } from '../../issues/utils/dates';
import { useApiData } from '../../../hooks/useApiData';
import ApiErrorNotice from '../../../components/shared/ApiErrorNotice';
import RecommendationsTable from '../components/RecommendationsTable';
import SummaryCards from '../components/SummaryCards';
import LoadingCards from '../../../components/shared/LoadingCards';
import type { CardFigure } from '../components/SummaryCards';

// The Overview: each role sees the cards that matter for its work,
// counted over the places it is responsible for.
function MyWorkPage() {
  const navigate = useNavigate();
  const { currentUser, users, locations, scope, ready } = useCurrentUser();
  const issuesData = useApiData<StoredIssue[]>(getIssues, []);
  const recommendationsData = useApiData<StoredRecommendation[]>(getStoredRecommendations, []);

  if (ready && !currentUser) {
    return (
      <div className="page">
        <InlineNotification
          kind="info"
          lowContrast
          hideCloseButton
          title="Choose a user"
          subtitle='Open the profile icon (top right) and pick a user under "Acting as" to see their overview.'
        />
      </div>
    );
  }

  const visible = recommendationsInScope(
    recommendationsData.data,
    issuesData.data,
    scope,
    currentUser
  );
  const mine = visible.filter((recommendation) => recommendation.responsiblePersonId === currentUser?.id);

  const today = getToday();
  const inSevenDays = addDays(today, 7);
  const withStatus = (status: string) =>
    visible.filter((recommendation) => recommendation.status === status).length;
  const dueSoon = visible.filter(
    (recommendation) =>
      recommendation.status !== 'Closed' &&
      recommendation.dueDate >= today &&
      recommendation.dueDate <= inSevenDays
  ).length;

  // The cards for each role. Escalations are counted once that action is saved to the server.
  const cardsByRole: Record<Role, CardFigure[]> = {
    CHP: [
      { title: 'Assigned to you', count: mine.length },
      { title: 'Pending acceptance', count: withStatus('Pending acceptance') },
      { title: 'Due within 7 days', count: dueSoon },
      { title: 'Overdue', count: withStatus('Overdue') },
    ],
    FACILITY_REPORTER: [
      { title: 'Assigned to you', count: mine.length },
      { title: 'Pending acceptance', count: withStatus('Pending acceptance') },
      { title: 'In progress', count: withStatus('In progress') },
      { title: 'Pending approval', count: withStatus('Pending approval') },
      { title: 'Due within 7 days', count: dueSoon },
      { title: 'Overdue', count: withStatus('Overdue') },
    ],
    FACILITY_CHAIR: [
      { title: 'Awaiting your approval', count: withStatus('Pending approval') },
      { title: 'Open', count: withStatus('Open') },
      { title: 'In progress', count: withStatus('In progress') },
      { title: 'Due within 7 days', count: dueSoon },
      { title: 'Overdue', count: withStatus('Overdue') },
      { title: 'Closed', count: withStatus('Closed') },
    ],
    PCN_COORDINATOR: [
      { title: 'Overdue, to reassign', count: withStatus('Overdue') },
      { title: 'Pending acceptance', count: withStatus('Pending acceptance') },
      { title: 'Due within 7 days', count: dueSoon },
      { title: 'Assigned to you', count: mine.length },
    ],
    SUBCOUNTY_COORDINATOR: [
      { title: 'Pending acceptance', count: withStatus('Pending acceptance') },
      { title: 'In progress', count: withStatus('In progress') },
      { title: 'Pending approval', count: withStatus('Pending approval') },
      { title: 'Due within 7 days', count: dueSoon },
      { title: 'Overdue', count: withStatus('Overdue') },
      { title: 'Closed', count: withStatus('Closed') },
    ],
    COUNTY_SURVEILLANCE_LEAD: [
      { title: 'Pending acceptance', count: withStatus('Pending acceptance') },
      { title: 'In progress', count: withStatus('In progress') },
      { title: 'Pending approval', count: withStatus('Pending approval') },
      { title: 'Due within 7 days', count: dueSoon },
      { title: 'Overdue', count: withStatus('Overdue') },
      { title: 'Closed', count: withStatus('Closed') },
    ],
    SYSTEM_ADMIN: [
      { title: 'Users', count: users.length },
      { title: 'Locations', count: locations.length },
    ],
  };

  const places = currentUser?.assignedLocations.join(', ') ?? '';
  // Show placeholders, not "No recommendations yet", until the first answer arrives.
  const loading = !ready || issuesData.loading || recommendationsData.loading;
  const isAdmin = currentUser?.role === 'SYSTEM_ADMIN';

  return (
    <div className="page">
      {currentUser && (
        <div className="page-header">
          <div>
            <h1>Overview</h1>
            <p className="page-subtitle">
              {roleLabels[currentUser.role]} · {places}
            </p>
          </div>
        </div>
      )}

      {(issuesData.failed || recommendationsData.failed) && <ApiErrorNotice />}

      {currentUser &&
        (loading ? (
          <LoadingCards count={cardsByRole[currentUser.role].length} />
        ) : (
          <SummaryCards cards={cardsByRole[currentUser.role]} />
        ))}

      {isAdmin ? (
        <InlineNotification
          kind="info"
          lowContrast
          hideCloseButton
          title="Setup"
          subtitle="Admins manage users, locations and the escalation matrix. Those pages come next."
        />
      ) : loading ? (
        <DataTableSkeleton
          headers={[{ header: 'ID' }, { header: 'Recommendation' }, { header: 'Level' }, { header: 'Due' }, { header: 'Status' }]}
          columnCount={5}
          rowCount={4}
          showToolbar={false}
        />
      ) : (
        <RecommendationsTable
          recommendations={visible.map(toTableRow)}
          description={`Recommendations at ${places} and the places under it, plus any assigned to you`}
        />
      )}

      {can(currentUser, 'issue.log') && (
        <div className="form-actions page-bottom-actions">
          <Button onClick={() => navigate('/issues/new')}>Log issue</Button>
        </div>
      )}
    </div>
  );
}

export default MyWorkPage;
