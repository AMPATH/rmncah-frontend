import type { StoredIssue, StoredRecommendation } from '../../issues/services/issueService';
import { addDays } from '../../issues/utils/dates';
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
