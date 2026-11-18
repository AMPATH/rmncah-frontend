import { apiGet, apiPatch } from '../../../api/apiClient';
import type { AppNotification } from '../types/notification.types';

export const NOTIFICATIONS_CHANGED_EVENT = 'mpdsr:notifications-changed';

function sentAt(notification: AppNotification): string {
  return notification.at ?? notification.date;
}

export async function getNotifications(recipientId: string): Promise<AppNotification[]> {
  if (!recipientId) {
    return [];
  }
  const notifications = await apiGet<AppNotification[]>('/notifications', { recipientId });
  return [...notifications].sort((a, b) => sentAt(b).localeCompare(sentAt(a)));
}

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
