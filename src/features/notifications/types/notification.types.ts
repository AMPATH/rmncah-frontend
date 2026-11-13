// What a notification is about. Each tab on the Notifications page shows one or more of these.
export type NotificationCategory =
  | 'assigned'
  | 'acceptance-needed'
  | 'reminder'
  | 'escalated'
  | 'overdue'
  | 'approval-needed'
  | 'approved'
  | 'rejected';

export interface AppNotification {
  id: string;
  // The user the notification is for.
  recipientId: string;
  date: string;
  message: string;
  recommendationId: string;
  from: string;
  category: NotificationCategory;
  read: boolean;
}
