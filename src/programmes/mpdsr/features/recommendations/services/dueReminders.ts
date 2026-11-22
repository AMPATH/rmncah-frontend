import { apiGet, apiPost } from '../../../api/apiClient';
import { daysBetween, getToday } from '../../../utils/dates';
import type { StoredRecommendation } from '../../issues/services/issueService';
import type { AppNotification } from '../../notifications/types/notification.types';

const stillRunning = ['Open', 'Pending acceptance', 'In progress'];
const reminderDays = [7, 1, 0];
const DUE_PREFIX = 'Due ';
const sending = new Set<string>();

export function dueReminderFor(recommendation: StoredRecommendation, today: string): string | null {
  if (!stillRunning.includes(recommendation.status) || !recommendation.dueDate || !recommendation.responsiblePersonId) {
    return null;
  }
  const daysLeft = daysBetween(today, recommendation.dueDate);
  if (!reminderDays.includes(daysLeft)) return null;
  if (daysLeft === 0) return `${DUE_PREFIX}today: ${recommendation.code} must be completed today`;
  const when = daysLeft === 1 ? 'tomorrow' : `in ${daysLeft} days`;
  return `${DUE_PREFIX}${when}: ${recommendation.code} is due on ${recommendation.dueDate}`;
}

export async function sendDueReminders(recommendations: StoredRecommendation[]): Promise<void> {
  const today = getToday();
  for (const recommendation of recommendations) {
    const message = dueReminderFor(recommendation, today);
    if (!message || sending.has(recommendation.code)) continue;
    sending.add(recommendation.code);
    try {
      const sentToday = await apiGet<AppNotification[]>('/notifications', {
        recipientId: recommendation.responsiblePersonId,
        recommendationId: recommendation.code,
        category: 'reminder',
        date: today,
      });
      if (sentToday.some((notification) => notification.message.startsWith(DUE_PREFIX))) continue;
      await apiPost<AppNotification>('/notifications', {
        recipientId: recommendation.responsiblePersonId,
        date: today,
        at: new Date().toISOString(),
        message,
        recommendationId: recommendation.code,
        from: 'System',
        category: 'reminder',
        read: false,
      });
    } catch {
      // A failed reminder is tried again the next time the list loads.
    } finally {
      sending.delete(recommendation.code);
    }
  }
}