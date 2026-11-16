import { useCurrentUser } from '../../../auth/CurrentUserContext';
import { recommendationsInScope } from '../../../auth/scope';
import { useApiData } from '../../../hooks/useApiData';
import { getIssues } from '../../issues/services/issueService';
import type { StoredIssue, StoredRecommendation } from '../../issues/services/issueService';
import { getRecommendationByCode, getRecommendationEvents } from '../services/recommendationService';
import type { RecommendationEvent } from '../services/recommendationService';

// Everything a page needs about one recommendation: the recommendation itself (null when it
// doesn't exist or is outside the user's places), its issue and its history.
// Call reload() after an action to show the new status.
export function useRecommendation(code: string) {
  const { currentUser, scope } = useCurrentUser();

  const recommendationData = useApiData<StoredRecommendation | null>(
    () => getRecommendationByCode(code),
    null,
    [code]
  );
  const issuesData = useApiData<StoredIssue[]>(getIssues, []);
  const eventsData = useApiData<RecommendationEvent[]>(() => getRecommendationEvents(code), [], [code]);

  const found = recommendationData.data;
  const visible =
    found !== null && recommendationsInScope([found], issuesData.data, scope, currentUser).length > 0;

  function reload() {
    recommendationData.reload();
    eventsData.reload();
  }

  return {
    recommendation: visible ? found : null,
    issue: issuesData.data.find((item) => item.id === found?.issueId),
    events: eventsData.data,
    loading: recommendationData.loading || issuesData.loading || eventsData.loading,
    failed: recommendationData.failed || issuesData.failed || eventsData.failed,
    reload,
  };
}
