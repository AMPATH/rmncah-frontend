// What a notification is about. Each tab on the Notifications page shows one or more of these.
export type NotificationCategory =
  | 'assigned'
  | 'acceptance-needed'
  | 'reminder'
  | 'escalated'
  | 'overdue'
  | 'approval-needed'
  | 'approved'
  | 'rejected'
  | 'cancelled';

export interface AppNotification {
  id: string;
  // The user the notification is for.
  recipientId: string;
  date: string;
  // When it was sent (date and time). Older notifications only have `date`.
  at?: string;
  message: string;
  recommendationId: string;
  from: string;
  category: NotificationCategory;
  read: boolean;
}
