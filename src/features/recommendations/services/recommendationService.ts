import { apiGet, apiPatch, apiPost } from '../../../services/apiClient';
import type { StoredRecommendation } from '../../issues/services/issueService';
import type { Level, RecommendationStatus } from '../../issues/types/issue.types';
import type { AppNotification, NotificationCategory } from '../../notifications/types/notification.types';
import { getToday } from '../../issues/utils/dates';

export type RecommendationEventAction =
  | 'accepted'
  | 'escalated'
  | 'de-escalated'
  | 'marked-done'
  | 'approved'
  | 'rejected'
  | 'marked-overdue'
  | 'reassigned';

// Who did a step the server did on its own (e.g. marking a recommendation overdue).
export const SYSTEM_USER_ID = 'system';

// One step in a recommendation's history.
export interface RecommendationEvent {
  id: string;
  code: string;
  at: string;
  byUserId: string;
  action: RecommendationEventAction;
  fromStatus: RecommendationStatus;
  toStatus: RecommendationStatus;
  note: string;
}

// One recommendation, found by its readable code (ISS-2026-0001-R1).
// json-server: GET /recommendations?code=…  The real API: GET /recommendations/:id.
export async function getRecommendationByCode(code: string): Promise<StoredRecommendation | null> {
  const matches = await apiGet<StoredRecommendation[]>('/recommendations', { code });
  const [checked] = await markOverdue(matches);
  return checked ?? null;
}

// Its history, oldest first. The real API returns this as `history[]` on the detail.
export function getRecommendationEvents(code: string): Promise<RecommendationEvent[]> {
  return apiGet<RecommendationEvent[]>('/recommendationEvents', { code });
}

interface Notify {
  recipientIds: string[];
  message: string;
  category: NotificationCategory;
}

// For json-server only: change the recommendation, add a history entry and send notifications.
// The real backend does all three in one call per action (see docs/api-contract.md),
// so only the bodies of the functions below will change.
async function applyChange(
  recommendation: StoredRecommendation,
  changes: Partial<StoredRecommendation> & { status: RecommendationStatus },
  byUserId: string,
  action: RecommendationEventAction,
  note: string,
  notify?: Notify
): Promise<StoredRecommendation> {
  const updated = await apiPatch<StoredRecommendation>(`/recommendations/${recommendation.id}`, changes);

  await apiPost<RecommendationEvent>('/recommendationEvents', {
    code: recommendation.code,
    at: new Date().toISOString(),
    byUserId,
    action,
    fromStatus: recommendation.status,
    toStatus: changes.status,
    note,
  });

  for (const recipientId of notify?.recipientIds ?? []) {
    await apiPost<AppNotification>('/notifications', {
      recipientId,
      date: getToday(),
      message: notify!.message,
      recommendationId: recommendation.code,
      from: 'System',
      category: notify!.category,
      read: false,
    });
  }

  return updated;
}

// POST /recommendations/:id/accept
export function acceptRecommendation(recommendation: StoredRecommendation, byUserId: string) {
  return applyChange(recommendation, { status: 'In progress' }, byUserId, 'accepted', '');
}

// POST /recommendations/:id/escalate
export function escalateRecommendation(
  recommendation: StoredRecommendation,
  byUserId: string,
  direction: 'escalate' | 'de-escalate',
  targetLevel: Level,
  targetUserId: string,
  reason: string
) {
  return applyChange(
    recommendation,
    { status: 'Pending acceptance', level: targetLevel, responsiblePersonId: targetUserId },
    byUserId,
    direction === 'escalate' ? 'escalated' : 'de-escalated',
    reason,
    {
      recipientIds: [targetUserId],
      message: 'A recommendation was moved to you and needs your acceptance within 3 days',
      category: 'escalated',
    }
  );
}

// POST /recommendations/:id/mark-done  (the evidence file is uploaded once the backend exists)
export function markRecommendationDone(
  recommendation: StoredRecommendation,
  byUserId: string,
  remarks: string,
  evidenceFileName: string,
  chairIds: string[]
) {
  const note = evidenceFileName ? `${remarks} · Evidence: ${evidenceFileName}` : remarks;
  return applyChange(recommendation, { status: 'Pending approval' }, byUserId, 'marked-done', note, {
    recipientIds: chairIds,
    message: 'Completed work is waiting for your approval',
    category: 'approval-needed',
  });
}

// POST /recommendations/:id/decision
export function decideRecommendation(
  recommendation: StoredRecommendation,
  byUserId: string,
  decision: 'approve' | 'reject',
  reason: string
) {
  const approved = decision === 'approve';
  return applyChange(
    recommendation,
    { status: approved ? 'Closed' : 'In progress' },
    byUserId,
    approved ? 'approved' : 'rejected',
    reason,
    {
      recipientIds: recommendation.responsiblePersonId ? [recommendation.responsiblePersonId] : [],
      message: approved ? 'Your completed work was approved and closed' : 'Your completed work was rejected and reopened',
      category: approved ? 'approved' : 'rejected',
    }
  );
}

// POST /recommendations/:id/reassign
export function reassignRecommendation(
  recommendation: StoredRecommendation,
  byUserId: string,
  newUserId: string,
  newDueDate: string,
  reason: string
) {
  return applyChange(
    recommendation,
    {
      status: 'Pending acceptance',
      responsiblePersonId: newUserId,
      dueDate: newDueDate,
      timesRedone: recommendation.timesRedone + 1,
    },
    byUserId,
    'reassigned',
    reason,
    {
      recipientIds: [newUserId],
      message: 'An overdue recommendation was reassigned to you and needs your acceptance within 3 days',
      category: 'acceptance-needed',
    }
  );
}

// Still running and past its due date: these become Overdue.
const canGoOverdue: RecommendationStatus[] = ['Open', 'Pending acceptance', 'In progress'];

// Codes being marked right now, so two pages loading at once don't mark the same one twice.
const marking = new Set<string>();

// For json-server only. The real backend marks recommendations overdue on its own every day,
// so this function (and its two calls) will be removed.
export async function markOverdue(recommendations: StoredRecommendation[]): Promise<StoredRecommendation[]> {
  const today = getToday();

  return Promise.all(
    recommendations.map(async (recommendation) => {
      const late =
        canGoOverdue.includes(recommendation.status) &&
        recommendation.dueDate !== '' &&
        recommendation.dueDate < today;

      if (!late || marking.has(recommendation.code)) {
        return recommendation;
      }

      marking.add(recommendation.code);
      try {
        return await applyChange(
          recommendation,
          { status: 'Overdue' },
          SYSTEM_USER_ID,
          'marked-overdue',
          `Due date ${recommendation.dueDate} passed before completion.`,
          {
            recipientIds: recommendation.responsiblePersonId ? [recommendation.responsiblePersonId] : [],
            message: 'A recommendation assigned to you is overdue',
            category: 'overdue',
          }
        );
      } finally {
        marking.delete(recommendation.code);
      }
    })
  );
}
