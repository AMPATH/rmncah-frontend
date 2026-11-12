import { apiGet, apiPatch } from '../../../services/apiClient';
import type { AppNotification } from '../types/notification.types';

export async function getNotifications(): Promise<AppNotification[]> {
  const notifications = await apiGet<AppNotification[]>('/notifications');
  // Newest first.
  return [...notifications].sort((a, b) => b.date.localeCompare(a.date));
}

export async function markAllAsRead(notifications: AppNotification[]): Promise<void> {
  const unread = notifications.filter((notification) => !notification.read);
  await Promise.all(
    unread.map((notification) => apiPatch(`/notifications/${notification.id}`, { read: true }))
  );
}
