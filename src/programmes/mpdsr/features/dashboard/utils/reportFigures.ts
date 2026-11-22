import type { StoredIssue, StoredRecommendation } from '../../issues/services/issueService';
import { addDays, daysBetween } from '../../../utils/dates';
import type { RecommendationEvent } from '../../recommendations/services/recommendationService';
import { placesWithin } from '../../../auth/locations';
import type { Location } from '../../../auth/locations';
import type { DashboardFilterValues } from '../types/dashboard.types';

function periodStart(period: string, today: string): string {
  const [year, month] = today.split('-');
  if (period === 'this-month') return `${year}-${month}-01`;
  if (period === 'this-year') return `${year}-01-01`;
  if (period === 'last-3-months') return addDays(today, -91);
  if (period === 'last-6-months') return addDays(today, -182);
  return '';
}

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

const startsWaiting: RecommendationEvent['action'][] = ['escalated', 'de-escalated', 'reassigned', 'auto-escalated'];

function dayOf(iso: string): string {
  return iso.slice(0, 10);
}

function countWith(events: RecommendationEvent[], actions: RecommendationEvent['action'][]): number {
  return new Set(events.filter((event) => actions.includes(event.action)).map((event) => event.code)).size;
}

function share(part: number, whole: number): string {
  return whole === 0 ? '—' : `${part} of ${whole} (${Math.round((part / whole) * 100)}%)`;
}

export function performanceFigures(recommendations: StoredRecommendation[], events: RecommendationEvent[]) {
  const shownCodes = new Set(recommendations.map((recommendation) => recommendation.code));
  const shownEvents = events.filter((event) => shownCodes.has(event.code));

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

  const closed = recommendations.filter((recommendation) => recommendation.status === 'Closed');
  const onTime = closed.filter((recommendation) => {
    const approvals = shownEvents.filter((event) => event.code === recommendation.code && event.action === 'approved');
    const approvedOn = approvals.length > 0 ? dayOf(approvals[approvals.length - 1].at) : '';
    return approvedOn !== '' && approvedOn <= recommendation.dueDate;
  }).length;

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

export interface CountRow {
  label: string;
  value: number;
}

const delayNames: Record<string, string> = {
  '1st': '1st delay · Personal or family',
  '2nd': '2nd delay · Access to care',
  '3rd': '3rd delay · Quality of care',
};

const periodNames: Record<string, string> = {
  antenatal: 'Antenatal',
  intrapartum: 'Intrapartum',
  postpartum: 'Postpartum',
};

function tally(values: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return counts;
}

function ranked(counts: Map<string, number>, limit?: number): CountRow[] {
  const rows = [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
  return limit ? rows.slice(0, limit) : rows;
}

export function issueBreakdowns(issues: StoredIssue[]) {
  const setting: CountRow[] = [
    { label: 'Facility', value: issues.filter((issue) => issue.setting === 'facility').length },
    { label: 'Community', value: issues.filter((issue) => issue.setting === 'community').length },
  ];

  const delay: CountRow[] = Object.entries(delayNames).map(([id, label]) => ({
    label,
    value: issues.filter((issue) => issue.contributingFactors.some((factor) => factor.startsWith(`${id} delay:`))).length,
  }));

  const factors = ranked(
    tally(issues.flatMap((issue) => issue.contributingFactors.map((factor) => factor.replace(/ delay: /, ' · ')))),
    5
  );

  const causes = ranked(tally(issues.filter((issue) => issue.issueType !== 'near-miss').map((issue) => issue.causeOfDeath || 'Not recorded')), 6);

  const periods: CountRow[] = [
    ...Object.entries(periodNames).map(([key, label]) => ({
      label,
      value: issues.filter((issue) => issue.periodOfDeath === key).length,
    })),
    { label: 'Not recorded', value: issues.filter((issue) => !periodNames[issue.periodOfDeath]).length },
  ];

  return { setting, delay, factors, causes, periods };
}
