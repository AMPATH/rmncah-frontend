import type {
  Feedback,
  FeedbackResponse,
} from '../../../core/data/models'

export interface FeedbackRecord extends Feedback {
  responses: FeedbackResponse[]
  responseCount: number
}

export interface FeedbackFormData {
  subject: string
  message: string
  recordType: Feedback['recordType']
  category: Feedback['category']
  direction: Feedback['direction']
  priority: Feedback['priority']
  senderId?: string | null
  senderName: string
  senderRole: Feedback['senderRole']
  recipientId?: string | null
  recipientName: string
  recipientRole: Feedback['recipientRole']
  facilityId?: string | null
  cohortId?: string | null
  assignedToId?: string | null
  assignedToName?: string | null
  followUp?: string
  dueDate?: string | null
}

export interface FeedbackResponseFormData {
  responderId?: string | null
  responderName: string
  responderRole: Feedback['senderRole']
  message: string
}

export interface FeedbackSummary {
  totalFeedback: number
  totalChallenges: number
  pending: number
  inProgress: number
  resolved: number
  urgent: number
}