import type { StoredIssue } from '../services/issueService';
import { isReviewed } from './caseReview';

export interface IssueFilterValues {
  search: string;
  issueType: string;
  place: string;
  review: string;
  from: string;
  to: string;
}

export const noIssueFilters: IssueFilterValues = { search: '', issueType: '', place: '', review: '', from: '', to: '' };

export function reviewState(issue: StoredIssue): 'cancelled' | 'reviewed' | 'pending' {
  if (issue.cancelled) return 'cancelled';
  return isReviewed(issue) ? 'reviewed' : 'pending';
}

// placeSet holds the chosen place and every place under it; null means all places.
export function filterIssues(issues: StoredIssue[], filters: IssueFilterValues, placeSet: Set<string> | null): StoredIssue[] {
  const words = filters.search.trim().toLowerCase();
  return issues.filter(
    (issue) =>
      (filters.issueType === '' || issue.issueType === filters.issueType) &&
      (placeSet === null || placeSet.has(issue.loggedAt)) &&
      (filters.review === '' || reviewState(issue) === filters.review) &&
      (filters.from === '' || issue.dateLogged >= filters.from) &&
      (filters.to === '' || issue.dateLogged <= filters.to) &&
      (words === '' ||
        [issue.code, issue.loggedAt, issue.causeOfDeath, issue.comments]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(words)))
  );
}