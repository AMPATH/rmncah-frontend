import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, DataTableSkeleton, InlineNotification, Select, SelectItem } from '@carbon/react';
import { can } from '../../../auth/permissions';
import { useCurrentUser } from '../../../context/currentUserContext';
import { recommendationsInScope } from '../../../auth/scope';
import { getIssues, getStoredRecommendations, toTableRow } from '../../issues/services/issueService';
import type { StoredIssue, StoredRecommendation } from '../../issues/services/issueService';
import { getAllRecommendationEvents } from '../../recommendations/services/recommendationService';
import type { RecommendationEvent } from '../../recommendations/services/recommendationService';
import { getToday } from '../../../utils/dates';
import { useApiData } from '../../../hooks/useApiData';
import ApiErrorNotice from '../../../components/shared/ApiErrorNotice';
import LoadingCards from '../../../components/shared/LoadingCards';
import RecommendationsTable from '../components/RecommendationsTable';
import SummaryCards from '../components/SummaryCards';
import KpiCard from '../components/KpiCard';
import BarList from '../components/BarList';
import ActionList from '../components/ActionList';
import { actionLabels, needsAction, overviewFigures } from '../utils/overviewFigures';
import type { ActionKey } from '../utils/overviewFigures';
import './OverviewPage.scss';

const decisionsByRole: Partial<Record<string, { status: string; text: string }>> = {
  FACILITY_CHAIR: { status: 'Pending approval', text: 'plus work waiting for your approval' },
  PCN_COORDINATOR: { status: 'Overdue', text: 'plus overdue work for you to reassign' },
};

const issueTypes = [
  { value: '', label: 'All types' },
  { value: 'maternal', label: 'Maternal' },
  { value: 'perinatal', label: 'Perinatal' },
  { value: 'near-miss', label: 'Near miss' },
];

function OverviewPage() {
  const navigate = useNavigate();
  const { currentUser, users, locations, scope, ready } = useCurrentUser();
  const issuesData = useApiData<StoredIssue[]>(getIssues, []);
  const recommendationsData = useApiData<StoredRecommendation[]>(getStoredRecommendations, []);
  const eventsData = useApiData<RecommendationEvent[]>(getAllRecommendationEvents, []);
  const [issueType, setIssueType] = useState('');
  const [focus, setFocus] = useState<ActionKey | ''>('');
  const tableRef = useRef<HTMLDivElement>(null);

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

  const loading = !ready || issuesData.loading || recommendationsData.loading || eventsData.loading;
  const failed = issuesData.failed || recommendationsData.failed || eventsData.failed;
  const places = currentUser?.assignedLocations.join(', ') ?? '';
  const today = getToday();

  if (currentUser?.role === 'SYSTEM_ADMIN') {
    return (
      <div className="page">
        <div className="page-header">
          <div>
            <h1>Overview</h1>
            <p className="page-subtitle">System administrator</p>
          </div>
        </div>
        <SummaryCards
          cards={[
            { title: 'Users', count: users.filter((user) => user.deleted !== true).length },
            { title: 'Places', count: locations.length },
          ]}
        />
        <InlineNotification
          kind="info"
          lowContrast
          hideCloseButton
          title="Setup"
          subtitle="Manage users, places and the escalation matrix from the menu."
        />
      </div>
    );
  }

  const decisions = currentUser ? decisionsByRole[currentUser.role] : undefined;
  const mine = recommendationsInScope(recommendationsData.data, issuesData.data, scope, currentUser).filter(
    (recommendation) =>
      recommendation.status !== 'Cancelled' &&
      (recommendation.responsiblePersonId === currentUser?.id || recommendation.status === decisions?.status)
  );
  const myIssueIds = new Set(mine.map((recommendation) => recommendation.issueId));
  const ofType = (issue: StoredIssue) =>
    issue.cancelled !== true && (issueType === '' || issue.issueType === issueType);
  const loggedByMe = issuesData.data.filter((issue) => issue.loggedById === currentUser?.id && ofType(issue));
  const shownIssues = issuesData.data.filter(
    (issue) => ofType(issue) && (issue.loggedById === currentUser?.id || myIssueIds.has(issue.id))
  );
  const shownIssueIds = new Set(shownIssues.map((issue) => issue.id));
  const shown = mine.filter((recommendation) => shownIssueIds.has(recommendation.issueId));
  const figures = overviewFigures(shownIssues, shown, eventsData.data, today);
  const inTable = focus === '' ? shown : shown.filter((recommendation) => needsAction(focus, recommendation, eventsData.data, today));

  function openList(key: ActionKey) {
    setFocus(key);
    tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="page">
      <div className="overview-header">
        <div>
          <h1>Overview</h1>
          {currentUser && (
            <p className="page-subtitle">
              Your work · {currentUser.level} · {places}
            </p>
          )}
        </div>
        <div className="overview-header__tools">
          <Select
            id="overviewIssueType"
            labelText="Issue type"
            value={issueType}
            onChange={(event) => setIssueType(event.target.value)}
          >
            {issueTypes.map((type) => (
              <SelectItem key={type.value} value={type.value} text={type.label} />
            ))}
          </Select>
          {can(currentUser, 'issue.log') && <Button onClick={() => navigate('/issues/new')}>Log issue</Button>}
        </div>
      </div>

      {failed && <ApiErrorNotice />}

      {loading ? (
        <LoadingCards count={5} />
      ) : (
        <>
          <div className="overview-kpis">
            <KpiCard value={loggedByMe.length} label="Issues you logged" />
            <KpiCard value={figures.recommendations} label="Your recommendations" />
            <KpiCard value={figures.overdue} label="Overdue" alert={figures.overdue > 0} />
            <KpiCard value={figures.closedByDueDate} label={`Closed by due date (${figures.closedByDueDateDetail})`} />
            <KpiCard value={figures.redone} label={`Redone (${figures.timesRedone} ${figures.timesRedone === 1 ? 'time' : 'times'})`} />
          </div>

          <div className="overview-panels">
            <section className="overview-panel">
              <h2>Items needing action</h2>
              <ActionList rows={figures.actions} selected={focus} onOpen={openList} />
            </section>
            <section className="overview-panel">
              <BarList title="Recommendations by status" rows={figures.byStatus} />
              <BarList title="By classification" rows={figures.byClassification} />
            </section>
            <section className="overview-panel">
              <BarList title="Issues by type" rows={figures.byType} />
              <BarList title="By level of delay" rows={figures.byDelay} />
            </section>
          </div>
        </>
      )}

      <div ref={tableRef}>
        {focus !== '' && (
          <div className="overview-table-focus">
            <span>Showing: {actionLabels[focus]}</span>
            <Button kind="ghost" size="sm" onClick={() => setFocus('')}>
              Show all
            </Button>
          </div>
        )}
        {loading ? (
          <DataTableSkeleton
            headers={[{ header: 'ID' }, { header: 'Recommendation' }, { header: 'Level' }, { header: 'Due' }, { header: 'Status' }]}
            columnCount={5}
            rowCount={4}
            showToolbar={false}
          />
        ) : (
          <RecommendationsTable
            recommendations={inTable.map(toTableRow)}
            description={`Recommendations assigned to you${decisions ? `, ${decisions.text}` : ''}`}
            emptyText="Nothing assigned to you right now."
          />
        )}
      </div>
    </div>
  );
}

export default OverviewPage;
