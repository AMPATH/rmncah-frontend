import type { StoredIssue, StoredRecommendation } from '../features/issues/services/issueService';
import type { User } from '../features/issues/types/issue.types';

export function issuesInScope(issues: StoredIssue[], scope: Set<string>): StoredIssue[] {
  return issues.filter((issue) => scope.has(issue.loggedAt));
}

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
