import { useCurrentUser } from '../../../context/currentUserContext';
import { recommendationsInScope } from '../../../auth/scope';
import { useApiData } from '../../../hooks/useApiData';
import { getIssues } from '../../issues/services/issueService';
import type { StoredIssue, StoredRecommendation } from '../../issues/services/issueService';
import { getRecommendationByCode, getRecommendationEvents } from '../services/recommendationService';
import type { RecommendationEvent } from '../services/recommendationService';
import { getEvidence } from '../services/evidenceService';
import type { EvidenceFile } from '../services/evidenceService';

export function useRecommendation(code: string) {
  const { currentUser, scope } = useCurrentUser();

  const recommendationData = useApiData<StoredRecommendation | null>(
    () => getRecommendationByCode(code),
    null,
    [code]
  );
  const issuesData = useApiData<StoredIssue[]>(getIssues, []);
  const eventsData = useApiData<RecommendationEvent[]>(() => getRecommendationEvents(code), [], [code]);
  const evidenceData = useApiData<EvidenceFile[]>(() => getEvidence(code), [], [code]);

  const found = recommendationData.data;
  const visible =
    found !== null && recommendationsInScope([found], issuesData.data, scope, currentUser).length > 0;

  function reload() {
    recommendationData.reload();
    eventsData.reload();
    evidenceData.reload();
  }

  return {
    recommendation: visible ? found : null,
    issue: issuesData.data.find((item) => item.id === found?.issueId),
    events: eventsData.data,
    evidence: visible ? evidenceData.data : [],
    loading: recommendationData.loading || issuesData.loading || eventsData.loading,
    failed: recommendationData.failed || issuesData.failed || eventsData.failed,
    reload,
  };
}
