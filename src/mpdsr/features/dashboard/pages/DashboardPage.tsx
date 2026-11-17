import { useState } from 'react';
import { Button } from '@carbon/react';
import { Download, Printer } from '@carbon/icons-react';
import DashboardFilters from '../components/DashboardFilters';
import StatPanel from '../components/StatPanel';
import type { DashboardFilterValues, StatRow } from '../types/dashboard.types';
import { downloadCsv } from '../utils/downloadCsv';
import { addDays, getToday } from '../../../utils/dates';
import { getIssues, getStoredRecommendations } from '../../issues/services/issueService';
import type { StoredIssue, StoredRecommendation } from '../../issues/services/issueService';
import { figuresByPlace, filterRecords, performanceFigures } from '../utils/reportFigures';
import PlaceTable from '../components/PlaceTable';
import { getAllRecommendationEvents } from '../../recommendations/services/recommendationService';
import type { RecommendationEvent } from '../../recommendations/services/recommendationService';
import { useApiData } from '../../../hooks/useApiData';
import ApiErrorNotice from '../../../components/shared/ApiErrorNotice';
import { useCurrentUser } from '../../../context/currentUserContext';
import { issuesInScope, recommendationsInScope } from '../../../auth/scope';
import './DashboardPage.scss';

const noFilters: DashboardFilterValues = {
  county: '',
  subCounty: '',
  facility: '',
  issueType: '',
  setting: '',
  period: '',
};

const filterLabels: Record<keyof DashboardFilterValues, string> = {
  county: 'County',
  subCounty: 'Sub-county',
  facility: 'Facility',
  issueType: 'Issue type',
  setting: 'Setting',
  period: 'Period',
};

interface Panel {
  title: string;
  rows: StatRow[];
  note?: string;
}

// Page 8: counts and performance, calculated by the backend from the records.
function DashboardPage() {
  const [filters, setFilters] = useState<DashboardFilterValues>(noFilters);

  // Reports only cover the places the current user is responsible for.
  const { currentUser, locations, scope } = useCurrentUser();
  const placesOfType = (type: string) =>
    locations
      .filter((location) => location.type === type && scope.has(location.name))
      .map((location) => location.name);
  const counties = placesOfType('county');
  const subCounties = placesOfType('sub-county');
  const facilities = placesOfType('facility');

  // Everything saved so far. The real backend will send ready-made figures instead.
  const issuesData = useApiData<StoredIssue[]>(getIssues, []);
  const recommendationsData = useApiData<StoredRecommendation[]>(getStoredRecommendations, []);
  const eventsData = useApiData<RecommendationEvent[]>(getAllRecommendationEvents, []);
  const loading = issuesData.loading || recommendationsData.loading || eventsData.loading;

  const today = getToday();
  const inSevenDays = addDays(today, 7);
  const { shownIssues, shownRecommendations } = filterRecords(
    issuesInScope(issuesData.data, scope),
    recommendationsInScope(recommendationsData.data, issuesData.data, scope, currentUser),
    filters,
    today,
    locations
  );

  const countIssues = (issueType: string) =>
    shownIssues.filter((issue) => issue.issueType === issueType).length;
  const countStatus = (status: string) =>
    shownRecommendations.filter((recommendation) => recommendation.status === status).length;
  const dueSoon = shownRecommendations.filter(
    (recommendation) =>
      recommendation.status !== 'Closed' && recommendation.status !== 'Cancelled' &&
      recommendation.dueDate >= today &&
      recommendation.dueDate <= inSevenDays
  ).length;

  const countField = (field: 'classification' | 'level', value: string) =>
    shownRecommendations.filter((recommendation) => recommendation[field] === value).length;
  const performance = performanceFigures(shownRecommendations, eventsData.data);
  const placeRows = figuresByPlace(shownIssues, shownRecommendations);

  const summaryPanels: Panel[] = [
    {
      title: 'Issues by type',
      rows: [
        { label: 'Perinatal', value: countIssues('perinatal') },
        { label: 'Maternal', value: countIssues('maternal') },
        { label: 'Near miss', value: countIssues('near-miss') },
      ],
      note: 'Also by setting, delay, cause and period of death.',
    },
    {
      title: 'Recommendations by status',
      rows: [
        { label: 'Open', value: countStatus('Open') },
        { label: 'In progress', value: countStatus('In progress') },
        { label: 'Overdue', value: countStatus('Overdue') },
        { label: 'Pending approval', value: countStatus('Pending approval') },
        { label: 'Closed', value: countStatus('Closed') },
        { label: 'Cancelled', value: countStatus('Cancelled') },
      ],
    },
    {
      title: 'Needs action',
      rows: [
        { label: 'Pending acceptance', value: countStatus('Pending acceptance') },
        { label: 'Pending approval', value: countStatus('Pending approval') },
        { label: 'Rejected at least once', value: performance.rejected },
        { label: 'Escalated or de-escalated', value: performance.escalated },
        { label: 'Due within 7 days', value: dueSoon },
        { label: 'Overdue', value: countStatus('Overdue') },
      ],
    },
    {
      title: 'By classification',
      rows: [
        { label: 'Immediate (1 month)', value: countField('classification', 'immediate') },
        { label: 'Intermediate (3 months)', value: countField('classification', 'intermediate') },
        { label: 'Long term (6 months)', value: countField('classification', 'long-term') },
      ],
    },
    {
      title: 'By level of implementation',
      rows: [
        { label: 'Community', value: countField('level', 'community') },
        { label: 'Facility', value: countField('level', 'facility') },
        { label: 'Sub-county', value: countField('level', 'sub-county') },
        { label: 'County', value: countField('level', 'county') },
      ],
    },
  ];

  const performancePanel: Panel = {
    title: 'Performance',
    rows: [
      { label: 'Average time to acceptance', value: performance.averageWait },
      { label: 'Closed by the due date', value: performance.completedOnTime },
      { label: 'Redone after going overdue', value: performance.redone },
    ],
    note: 'Worked out from each recommendation\'s history.',
  };

  // Changes one filter and keeps the others as they are.
  function handleFilterChange(name: keyof DashboardFilterValues, value: string) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

  // One CSV: the filters used, then every figure as "section, measure, value".
  function handleDownloadCsv() {
    const filterRows = (Object.keys(filterLabels) as (keyof DashboardFilterValues)[]).map(
      (key) => ['Filter', filterLabels[key], filters[key] || 'All']
    );
    const figureRows = [...summaryPanels, performancePanel].flatMap((panel) =>
      panel.rows.map((row) => [panel.title, row.label, row.value])
    );
    const placeFigureRows = placeRows.flatMap((row) => [
      ['By place', `${row.place}: issues`, row.issues],
      ['By place', `${row.place}: recommendations`, row.recommendations],
      ['By place', `${row.place}: still running`, row.running],
      ['By place', `${row.place}: overdue`, row.overdue],
      ['By place', `${row.place}: closed`, row.closed],
    ]);

    downloadCsv(`mpdsr-report-${today}.csv`, [
      ['MPDSR report', 'Generated', today],
      ...filterRows,
      ['Section', 'Measure', 'Value'],
      ...figureRows,
      ...placeFigureRows,
    ]);
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Reports</h1>
        <div className="form-actions no-print">
          <Button kind="tertiary" renderIcon={Download} onClick={handleDownloadCsv}>
            Download CSV
          </Button>
          <Button kind="ghost" renderIcon={Printer} onClick={() => window.print()}>
            Print or save as PDF
          </Button>
        </div>
      </div>

      {(issuesData.failed || recommendationsData.failed || eventsData.failed) && <ApiErrorNotice />}

      <div className="no-print">
        <DashboardFilters
          filters={filters}
          counties={counties}
          subCounties={subCounties}
          facilities={facilities}
          onFilterChange={handleFilterChange}
        />
      </div>

      <div className="dashboard-grid">
        {summaryPanels.map((panel) => (
          <StatPanel key={panel.title} title={panel.title} rows={panel.rows} note={panel.note} loading={loading} />
        ))}
      </div>

      <StatPanel
        title={performancePanel.title}
        rows={performancePanel.rows}
        note={performancePanel.note}
        loading={loading}
      />

      <div className="dashboard-places">
        <PlaceTable rows={placeRows} />
      </div>

      <p className="form-note">
        Figures are calculated from the records and limited to your access level.
      </p>
    </div>
  );
}

export default DashboardPage;
