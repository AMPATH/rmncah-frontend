import type { StoredIssue, StoredRecommendation } from '../features/issues/services/issueService';
import type { User } from '../features/issues/types/issue.types';

// The issues logged at a place the user may see.
export function issuesInScope(issues: StoredIssue[], scope: Set<string>): StoredIssue[] {
  return issues.filter((issue) => scope.has(issue.loggedAt));
}

// The recommendations the user may see: those of issues in their places,
// plus any assigned to them personally.
export function recommendationsInScope(
  recommendations: StoredRecommendation[],
  issues: StoredIssue[],
  scope: Set<string>,
  user: User | null
): StoredRecommendation[] {
  const visibleIssueIds = new Set(issuesInScope(issues, scope).map((issue) => issue.id));
  return recommendations.filter(
    (recommendation) =>
      visibleIssueIds.has(recommendation.issueId) ||
      (user !== null && recommendation.responsiblePersonId === user.id)
  );
}
