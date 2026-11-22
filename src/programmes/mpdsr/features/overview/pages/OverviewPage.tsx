import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Button,
  ContentSwitcher,
  DataTableSkeleton,
  InlineNotification,
  Select,
  SelectItem,
  Switch,
} from '@carbon/react';
import { can } from '../../../auth/permissions';
import { useCurrentUser } from '../../../context/currentUserContext';
import { issuesInScope, recommendationsInScope } from '../../../auth/scope';
import { placesWithin } from '../../../auth/locations';
import { getIssues, getStoredRecommendations, toTableRow } from '../../issues/services/issueService';
import type { StoredIssue, StoredRecommendation } from '../../issues/services/issueService';
import { getAllRecommendationEvents } from '../../recommendations/services/recommendationService';
import type { RecommendationEvent } from '../../recommendations/services/recommendationService';
import { getToday } from '../../../utils/dates';
import { useApiData } from '../../../hooks/useApiData';
import ApiErrorNotice from '../../../components/shared/ApiErrorNotice';
import DownloadMenu from '../../../components/shared/DownloadMenu';
import LoadingCards from '../../../components/shared/LoadingCards';
import RecommendationsTable from '../components/RecommendationsTable';
import SummaryCards from '../components/SummaryCards';
import ActionList from '../components/ActionList';
import TrackerRow from '../components/TrackerRow';
import FacilityTable from '../components/FacilityTable';
import { actionLabels, needsAction, overviewFigures } from '../utils/overviewFigures';
import type { ActionKey } from '../utils/overviewFigures';
import { countIn, dateFields, facilityRows, periodsFor, trackedTypes } from '../utils/trackerFigures';
import type { DateField, PeriodKey } from '../utils/trackerFigures';
import './OverviewPage.scss';
import '../components/Tracker.scss';

const decisionsByRole: Partial<Record<string, { status: string; text: string }>> = {
  FACILITY_CHAIR: { status: 'Pending approval', text: 'plus work waiting for your approval' },
  PCN_COORDINATOR: { status: 'Overdue', text: 'plus overdue work for you to reassign' },
};

const generalRoles = ['FACILITY_CHAIR', 'PCN_COORDINATOR', 'SUBCOUNTY_COORDINATOR', 'COUNTY_SURVEILLANCE_LEAD'];

const placeTypeOrder = ['county', 'sub-county', 'facility', 'community-unit'];
const placeTypeLabels: Record<string, string> = {
  county: 'County',
  'sub-county': 'Sub-county',
  facility: 'Facility',
  'community-unit': 'Community unit',
};

function OverviewPage() {
  const navigate = useNavigate();
  const { currentUser, users, locations, scope, ready } = useCurrentUser();
  const issuesData = useApiData<StoredIssue[]>(getIssues, []);
  const recommendationsData = useApiData<StoredRecommendation[]>(getStoredRecommendations, []);
  const eventsData = useApiData<RecommendationEvent[]>(getAllRecommendationEvents, []);
  const [place, setPlace] = useState('');
  const [dateField, setDateField] = useState<DateField>('dateLogged');
  const [tablePeriod, setTablePeriod] = useState<PeriodKey>('this-week');
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

  const general = currentUser !== null && generalRoles.includes(currentUser.role);
  const decisions = currentUser && !general ? decisionsByRole[currentUser.role] : undefined;

  const placeOptions = locations
    .filter((location) => scope.has(location.name))
    .sort(
      (a, b) =>
        placeTypeOrder.indexOf(a.type) - placeTypeOrder.indexOf(b.type) || a.name.localeCompare(b.name)
    );
  const chosenPlaces = place ? placesWithin([place], locations) : null;
  const inPlace = (issue: StoredIssue) => chosenPlaces === null || chosenPlaces.has(issue.loggedAt);

  const inScope = recommendationsInScope(recommendationsData.data, issuesData.data, scope, currentUser).filter(
    (recommendation) => recommendation.status !== 'Cancelled'
  );
  const mine = general
    ? inScope
    : inScope.filter(
        (recommendation) =>
          recommendation.status !== 'Pending review' &&
          (recommendation.responsiblePersonId === currentUser?.id || recommendation.status === decisions?.status)
      );
  const myIssueIds = new Set(mine.map((recommendation) => recommendation.issueId));
  const shownIssues = (
    general
      ? issuesInScope(issuesData.data, scope)
      : issuesData.data.filter((issue) => issue.loggedById === currentUser?.id || myIssueIds.has(issue.id))
  ).filter((issue) => issue.cancelled !== true && inPlace(issue));
  const shownIssueIds = new Set(shownIssues.map((issue) => issue.id));
  const shown = mine.filter((recommendation) => shownIssueIds.has(recommendation.issueId));
  const figures = overviewFigures(shownIssues, shown, eventsData.data, today);
  const inTable =
    focus === '' ? shown : shown.filter((recommendation) => needsAction(focus, recommendation, eventsData.data, today));

  const periods = periodsFor(today);
  const facilityPeriod = periods.find((period) => period.key === tablePeriod) ?? periods[1];
  const facilities = facilityRows(shownIssues, dateField, facilityPeriod, locations);

  function buildActionPlan(extension: 'xlsx' | 'pdf') {
    const nameOf = (id: string) => users.find((user) => user.id === id)?.fullName ?? '—';
    return {
      fileName: `mpdsr-action-plan-${today}.${extension}`,
      title: 'MPDSR action plan',
      details: [
        `Generated ${today}${currentUser ? ` by ${currentUser.fullName}` : ''}`,
        [place ? `Place: ${place}` : 'All places', focus ? `Showing: ${actionLabels[focus]}` : ''].filter(Boolean).join(' · '),
      ],
      sections: [
        {
          title: `${inTable.length} recommendation(s)`,
          head: ['ID', 'Issue', 'Recommendation', 'Level', 'Responsible person', 'Due', 'Status'],
          rows: inTable.map((recommendation) => [
            recommendation.code,
            recommendation.issueCode,
            recommendation.text,
            recommendation.level || '—',
            nameOf(recommendation.responsiblePersonId),
            recommendation.dueDate,
            recommendation.status,
          ]),
        },
      ],
    };
  }

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
              {general ? `All work in ${places} and the places under it` : `Your work · ${currentUser.level} · ${places}`}
            </p>
          )}
        </div>
        {can(currentUser, 'issue.log') && <Button onClick={() => navigate('/issues/new')}>Log issue</Button>}
      </div>

      <div className="overview-filters">
        <Select id="overviewPlace" labelText="Place" value={place} onChange={(event) => setPlace(event.target.value)}>
          <SelectItem value="" text={general ? 'All my places' : 'All'} />
          {placeOptions.map((location) => (
            <SelectItem
              key={location.id}
              value={location.name}
              text={`${location.name} (${placeTypeLabels[location.type] ?? location.type})`}
            />
          ))}
        </Select>
        <div className="overview-filters__switch">
          <p className="overview-filters__label">Count by</p>
          <ContentSwitcher
            size="md"
            selectedIndex={dateFields.findIndex((field) => field.key === dateField)}
            onChange={({ index }) => setDateField(dateFields[index ?? 0].key)}
          >
            {dateFields.map((field) => (
              <Switch key={field.key} name={field.key} text={field.label} />
            ))}
          </ContentSwitcher>
        </div>
      </div>

      {failed && <ApiErrorNotice />}

      {loading ? (
        <LoadingCards count={4} />
      ) : (
        <>
          {trackedTypes.map(({ type, label }) => (
            <TrackerRow
              key={type}
              title={label}
              type={type}
              cells={periods.map((period) => ({ period, count: countIn(shownIssues, type, dateField, period) }))}
            />
          ))}

          <FacilityTable
            rows={facilities}
            periods={periods}
            period={facilityPeriod}
            onPeriodChange={setTablePeriod}
          />

          <h2 className="overview-section-title">Recommendations</h2>
          <section className="overview-actions">
            <h3 className="overview-filters__label">Items needing action</h3>
            <ActionList rows={figures.actions} selected={focus} onOpen={openList} />
          </section>
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
            description={
              general
                ? 'All recommendations in your places'
                : `Recommendations assigned to you${decisions ? `, ${decisions.text}` : ''}`
            }
            emptyText={general ? 'No recommendations in your places yet.' : 'Nothing assigned to you right now.'}
            actions={<DownloadMenu size="sm" build={buildActionPlan} disabled={inTable.length === 0} />}
          />
        )}
      </div>
    </div>
  );
}

export default OverviewPage;