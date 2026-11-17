import { apiGet, apiPatch } from '../../../api/apiClient';
import type { AppNotification } from '../types/notification.types';

// Fired after notifications change (e.g. marked as read), so the bell's count refreshes.
export const NOTIFICATIONS_CHANGED_EVENT = 'mpdsr:notifications-changed';

// When a notification was sent, for sorting: the time if it has one, otherwise the day.
function sentAt(notification: AppNotification): string {
  return notification.at ?? notification.date;
}

// The signed-in user's notifications, newest first. The real API works out the user from
// the sign-in token; json-server needs the recipientId filter.
export async function getNotifications(recipientId: string): Promise<AppNotification[]> {
  if (!recipientId) {
    return [];
  }
  const notifications = await apiGet<AppNotification[]>('/notifications', { recipientId });
  return [...notifications].sort((a, b) => sentAt(b).localeCompare(sentAt(a)));
}

// PATCH /notifications/:id  { read: true }
export async function markAsRead(notificationId: string): Promise<void> {
  await apiPatch(`/notifications/${notificationId}`, { read: true });
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
}

export async function markAllAsRead(notifications: AppNotification[]): Promise<void> {
  const unread = notifications.filter((notification) => !notification.read);
  await Promise.all(
    unread.map((notification) => apiPatch(`/notifications/${notification.id}`, { read: true }))
  );
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
}
