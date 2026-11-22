export type NotificationCategory =
  | 'assigned'
  | 'acceptance-needed'
  | 'reminder'
  | 'escalated'
  | 'overdue'
  | 'approval-needed'
  | 'review-needed'
  | 'reviewed'
  | 'approved'
  | 'rejected'
  | 'cancelled';

export interface AppNotification {
  id: string;
  recipientId: string;
  date: string;
  at?: string;
  message: string;
  recommendationId: string;
  from: string;
  category: NotificationCategory;
  read: boolean;
}
