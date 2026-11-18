import { apiGet, apiPatch, apiPost } from '../../../api/apiClient';
import type { StoredIssue, StoredRecommendation } from '../../issues/services/issueService';
import type { DraftRecommendation, Level, RecommendationStatus, User } from '../../issues/types/issue.types';
import type { AppNotification, NotificationCategory } from '../../notifications/types/notification.types';
import { addDays, getToday } from '../../../utils/dates';
import { acceptanceDeadline, getEscalationMatrix } from './escalationMatrix';
import { placesWithin } from '../../../auth/locations';
import type { Location } from '../../../auth/locations';
import { uploadEvidence } from './evidenceService';

export type RecommendationEventAction =
  | 'accepted'
  | 'escalated'
  | 'de-escalated'
  | 'marked-done'
  | 'approved'
  | 'rejected'
  | 'marked-overdue'
  | 'reassigned'
  | 'auto-escalated'
  | 'edited'
  | 'cancelled';

export const SYSTEM_USER_ID = 'system';

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

export async function getRecommendationByCode(code: string): Promise<StoredRecommendation | null> {
  const matches = await apiGet<StoredRecommendation[]>('/recommendations', { code });
  const [checked] = await markOverdue(matches);
  return checked ?? null;
}

export function getRecommendationEvents(code: string): Promise<RecommendationEvent[]> {
  return apiGet<RecommendationEvent[]>('/recommendationEvents', { code });
}

interface Notify {
  recipientIds: string[];
  message: string;
  category: NotificationCategory;
}

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
      at: new Date().toISOString(),
      message: notify!.message,
      recommendationId: recommendation.code,
      from: 'System',
      category: notify!.category,
      read: false,
    });
  }

  return updated;
}

export function acceptRecommendation(recommendation: StoredRecommendation, byUserId: string) {
  return applyChange(recommendation, { status: 'In progress' }, byUserId, 'accepted', '');
}

export async function escalateRecommendation(
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
      message: `A recommendation was moved to you and needs your acceptance within ${await acceptanceDeadline(targetLevel)}`,
      category: 'escalated',
    }
  );
}

export async function markRecommendationDone(
  recommendation: StoredRecommendation,
  byUserId: string,
  remarks: string,
  evidence: File | null,
  chairIds: string[]
) {
  if (evidence) {
    await uploadEvidence(recommendation.code, evidence, byUserId);
  }
  const note = evidence ? `${remarks} · Evidence: ${evidence.name}` : remarks;
  return applyChange(recommendation, { status: 'Pending approval' }, byUserId, 'marked-done', note, {
    recipientIds: chairIds,
    message: 'Completed work is waiting for your approval',
    category: 'approval-needed',
  });
}

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

export async function reassignRecommendation(
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
      message: `An overdue recommendation was reassigned to you and needs your acceptance within ${await acceptanceDeadline(recommendation.level)}`,
      category: 'acceptance-needed',
    }
  );
}

const canGoOverdue: RecommendationStatus[] = ['Open', 'Pending acceptance', 'In progress'];

const marking = new Set<string>();

export async function markOverdue(recommendations: StoredRecommendation[]): Promise<StoredRecommendation[]> {
  const today = getToday();

  const checked = await Promise.all(
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
  return checkAcceptanceDeadlines(checked);
}

export function getAllRecommendationEvents(): Promise<RecommendationEvent[]> {
  return apiGet<RecommendationEvent[]>('/recommendationEvents');
}

export async function addRecommendationToIssue(
  issue: { id: string; code: string },
  draft: DraftRecommendation,
  existingCodes: string[]
): Promise<StoredRecommendation> {
  const numbers = existingCodes.map((code) => Number(code.split('-R').pop()) || 0);
  const code = `${issue.code}-R${Math.max(0, ...numbers) + 1}`;
  const needsAcceptance = draft.level === 'sub-county' || draft.level === 'county';
  const today = getToday();

  const saved = await apiPost<StoredRecommendation>('/recommendations', {
    ...draft,
    code,
    issueId: issue.id,
    issueCode: issue.code,
    dueDate: draft.dateOfCompletion,
    status: needsAcceptance ? 'Pending acceptance' : 'Open',
    timesRedone: 0,
    dateLogged: today,
  });

  if (draft.responsiblePersonId) {
    await apiPost<AppNotification>('/notifications', {
      recipientId: draft.responsiblePersonId,
      date: today,
      at: new Date().toISOString(),
      message: needsAcceptance
        ? `New recommendation needs your acceptance within ${await acceptanceDeadline(draft.level)}`
        : 'New recommendation assigned to you',
      recommendationId: code,
      from: 'System',
      category: needsAcceptance ? 'acceptance-needed' : 'assigned',
      read: false,
    });
  }

  return saved;
}

const AUTO_ESCALATION_NOTE = 'Auto-escalated to PCN to reassign or action';
const restartsWait: RecommendationEventAction[] = ['escalated', 'de-escalated', 'reassigned', 'auto-escalated'];
const checkingAcceptance = new Set<string>();

function waitingSince(recommendation: StoredRecommendation, events: RecommendationEvent[]): string {
  const restarts = events.filter((event) => restartsWait.includes(event.action));
  return restarts.length > 0 ? restarts[restarts.length - 1].at.slice(0, 10) : recommendation.dateLogged;
}

async function pcnCoordinatorFor(recommendation: StoredRecommendation): Promise<User | undefined> {
  const [users, issue, locations] = await Promise.all([
    apiGet<User[]>('/users'),
    apiGet<StoredIssue>(`/issues/${recommendation.issueId}`),
    apiGet<Location[]>('/locations'),
  ]);
  return users.find(
    (user) =>
      user.role === 'PCN_COORDINATOR' &&
      user.active !== false &&
      placesWithin(user.assignedLocations, locations).has(issue.loggedAt)
  );
}

export async function checkAcceptanceDeadlines(
  recommendations: StoredRecommendation[]
): Promise<StoredRecommendation[]> {
  const waiting = recommendations.filter((recommendation) => recommendation.status === 'Pending acceptance');
  if (waiting.length === 0) {
    return recommendations;
  }

  const today = getToday();
  const matrix = await getEscalationMatrix();
  const updated = new Map<string, StoredRecommendation>();

  for (const recommendation of waiting) {
    if (checkingAcceptance.has(recommendation.code) || !recommendation.responsiblePersonId) {
      continue;
    }
    checkingAcceptance.add(recommendation.code);
    try {
      const events = await getRecommendationEvents(recommendation.code);
      const since = waitingSince(recommendation, events);
      const deadline = addDays(since, matrix[recommendation.level]);
      const holder = (await apiGet<User[]>('/users', { id: recommendation.responsiblePersonId }))[0];

      if (today > deadline && holder?.role !== 'PCN_COORDINATOR') {
        const pcn = await pcnCoordinatorFor(recommendation);
        if (pcn) {
          updated.set(
            recommendation.code,
            await applyChange(
              recommendation,
              { status: 'Pending acceptance', level: 'sub-county', responsiblePersonId: pcn.id },
              SYSTEM_USER_ID,
              'auto-escalated',
              AUTO_ESCALATION_NOTE,
              {
                recipientIds: [pcn.id],
                message: `${recommendation.code} was not accepted in time: reassign it or accept it`,
                category: 'escalated',
              }
            )
          );
        }
      } else if (today > since && today <= deadline) {
        const sentToday = await apiGet<AppNotification[]>('/notifications', {
          recipientId: recommendation.responsiblePersonId,
          recommendationId: recommendation.code,
          category: 'reminder',
          date: today,
        });
        if (sentToday.length === 0) {
          await apiPost<AppNotification>('/notifications', {
            recipientId: recommendation.responsiblePersonId,
            date: today,
            at: new Date().toISOString(),
            message: `Reminder: ${recommendation.code} is waiting for your acceptance (deadline ${deadline})`,
            recommendationId: recommendation.code,
            from: 'System',
            category: 'reminder',
            read: false,
          });
        }
      }
    } finally {
      checkingAcceptance.delete(recommendation.code);
    }
  }

  return recommendations.map((recommendation) => updated.get(recommendation.code) ?? recommendation);
}

export function editRecommendation(
  recommendation: StoredRecommendation,
  byUserId: string,
  changes: { text: string; gap: string; dueDate: string }
) {
  const changed = [
    changes.text !== recommendation.text && 'recommendation text',
    changes.gap !== recommendation.gap && 'gap',
    changes.dueDate !== recommendation.dueDate && `due date (${recommendation.dueDate} → ${changes.dueDate})`,
  ].filter(Boolean);

  return applyChange(
    recommendation,
    { status: recommendation.status, text: changes.text, gap: changes.gap, dueDate: changes.dueDate },
    byUserId,
    'edited',
    `Changed: ${changed.join(', ')}`,
    {
      recipientIds:
        recommendation.responsiblePersonId && recommendation.responsiblePersonId !== byUserId
          ? [recommendation.responsiblePersonId]
          : [],
      message: `${recommendation.code} assigned to you was changed`,
      category: 'assigned',
    }
  );
}

export function cancelRecommendation(recommendation: StoredRecommendation, byUserId: string, reason: string) {
  return applyChange(recommendation, { status: 'Cancelled' }, byUserId, 'cancelled', reason, {
    recipientIds:
      recommendation.responsiblePersonId && recommendation.responsiblePersonId !== byUserId
        ? [recommendation.responsiblePersonId]
        : [],
    message: `${recommendation.code} assigned to you was cancelled`,
    category: 'cancelled',
  });
}
