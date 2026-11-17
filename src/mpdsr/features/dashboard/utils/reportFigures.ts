import type { StoredIssue, StoredRecommendation } from '../../issues/services/issueService';
import { addDays, daysBetween } from '../../../utils/dates';
import type { RecommendationEvent } from '../../recommendations/services/recommendationService';
import { placesWithin } from '../../../auth/locations';
import type { Location } from '../../../auth/locations';
import type { DashboardFilterValues } from '../types/dashboard.types';

// The first day of the chosen period, or '' for all time.
function periodStart(period: string, today: string): string {
  const [year, month] = today.split('-');
  if (period === 'this-month') return `${year}-${month}-01`;
  if (period === 'this-year') return `${year}-01-01`;
  if (period === 'last-3-months') return addDays(today, -91);
  if (period === 'last-6-months') return addDays(today, -182);
  return '';
}

// Keeps the issues that match the filters, and the recommendations of those issues.
// A chosen county, sub-county or facility keeps only issues logged there or in places under it.
export function filterRecords(
  issues: StoredIssue[],
  recommendations: StoredRecommendation[],
  filters: DashboardFilterValues,
  today: string,
  locations: Location[]
) {
  const start = periodStart(filters.period, today);
  const chosenPlace = filters.facility || filters.subCounty || filters.county;
  const placeScope = chosenPlace ? placesWithin([chosenPlace], locations) : null;

  const shownIssues = issues.filter(
    (issue) =>
      issue.cancelled !== true &&
      (filters.issueType === '' || issue.issueType === filters.issueType) &&
      (filters.setting === '' || issue.setting === filters.setting) &&
      (start === '' || issue.dateLogged >= start) &&
      (placeScope === null || placeScope.has(issue.loggedAt))
  );

  const shownIssueIds = new Set(shownIssues.map((issue) => issue.id));
  const shownRecommendations = recommendations.filter((recommendation) =>
    shownIssueIds.has(recommendation.issueId)
  );

  return { shownIssues, shownRecommendations };
}

// ---- Performance: worked out from each recommendation's history. ----
// The real backend will send these figures ready-made (GET /reports/summary).

// A step that leaves a recommendation waiting for someone to accept it.
const startsWaiting: RecommendationEvent['action'][] = ['escalated', 'de-escalated', 'reassigned', 'auto-escalated'];

function dayOf(iso: string): string {
  return iso.slice(0, 10);
}

// How many recommendations had at least one step of these kinds.
function countWith(events: RecommendationEvent[], actions: RecommendationEvent['action'][]): number {
  return new Set(events.filter((event) => actions.includes(event.action)).map((event) => event.code)).size;
}

// "3 of 4 (75%)", or "—" when there is nothing to count yet.
function share(part: number, whole: number): string {
  return whole === 0 ? '—' : `${part} of ${whole} (${Math.round((part / whole) * 100)}%)`;
}

export function performanceFigures(recommendations: StoredRecommendation[], events: RecommendationEvent[]) {
  const shownCodes = new Set(recommendations.map((recommendation) => recommendation.code));
  const shownEvents = events.filter((event) => shownCodes.has(event.code));

  // Time to acceptance: from when it started waiting (logged, escalated or reassigned)
  // to when it was accepted, averaged over every acceptance.
  const waits: number[] = [];
  for (const recommendation of recommendations) {
    const history = shownEvents.filter((event) => event.code === recommendation.code);
    let waitingSince = recommendation.dateLogged;
    for (const event of history) {
      if (startsWaiting.includes(event.action)) {
        waitingSince = dayOf(event.at);
      }
      if (event.action === 'accepted') {
        waits.push(daysBetween(waitingSince, dayOf(event.at)));
      }
    }
  }
  const averageWait = waits.length === 0 ? '—' : `${(waits.reduce((a, b) => a + b, 0) / waits.length).toFixed(1)} days`;

  // Completed by due date: closed recommendations approved on or before their due date.
  const closed = recommendations.filter((recommendation) => recommendation.status === 'Closed');
  const onTime = closed.filter((recommendation) => {
    const approvals = shownEvents.filter((event) => event.code === recommendation.code && event.action === 'approved');
    const approvedOn = approvals.length > 0 ? dayOf(approvals[approvals.length - 1].at) : '';
    return approvedOn !== '' && approvedOn <= recommendation.dueDate;
  }).length;

  // Redone: reassigned after going overdue.
  const redone = recommendations.filter((recommendation) => recommendation.timesRedone > 0);
  const timesRedone = redone.reduce((total, recommendation) => total + recommendation.timesRedone, 0);

  return {
    rejected: countWith(shownEvents, ['rejected']),
    escalated: countWith(shownEvents, ['escalated', 'de-escalated']),
    averageWait: waits.length === 0 ? averageWait : `${averageWait} (${waits.length} accepted)`,
    completedOnTime: share(onTime, closed.length),
    redone: redone.length === 0 ? 'None' : `${redone.length} recommendation(s), ${timesRedone} time(s) in all`,
  };
}

// One row of the "By place" table: where issues were logged, and how their recommendations stand.
export interface PlaceRow {
  id: string;
  place: string;
  issues: number;
  recommendations: number;
  running: number;
  overdue: number;
  closed: number;
}

export function figuresByPlace(issues: StoredIssue[], recommendations: StoredRecommendation[]): PlaceRow[] {
  const places = [...new Set(issues.map((issue) => issue.loggedAt))].sort();

  return places.map((place) => {
    const issueIds = new Set(issues.filter((issue) => issue.loggedAt === place).map((issue) => issue.id));
    const ofPlace = recommendations.filter((recommendation) => issueIds.has(recommendation.issueId));
    return {
      id: place,
      place,
      issues: issueIds.size,
      recommendations: ofPlace.length,
      running: ofPlace.filter((r) => r.status !== 'Closed' && r.status !== 'Overdue' && r.status !== 'Cancelled').length,
      overdue: ofPlace.filter((r) => r.status === 'Overdue').length,
      closed: ofPlace.filter((r) => r.status === 'Closed').length,
    };
  });
}
