
export type FeedbackDirection = 'Received' | 'Sent'

export type FeedbackStatus =
  | 'Pending'
  | 'In Progress'
  | 'Resolved'

export type FeedbackCategory =
  | 'Training'
  | 'Assessment'
  | 'Cohort'
  | 'Support'
  | 'General'

export interface MentorFeedback {
  id: string
  subject: string
  message: string
  direction: FeedbackDirection
  status: FeedbackStatus
  category: FeedbackCategory
  sender: string
  cohortId: string
  cohortName: string
  createdAt: string
  followUp: string
  response: string
}

export const mentorFeedbackData: MentorFeedback[] = [
  {
    id: 'feedback-001',
    subject: 'Additional competency assessment documentation',
    message:
      'Please provide additional documentation showing how competency was assessed for the practical training sessions.',
    direction: 'Received',
    status: 'Pending',
    category: 'Assessment',
    sender: 'County Mentor',
    cohortId: 'cohort-001',
    cohortName: 'Cohort A',
    createdAt: '2026-11-06T09:30:00.000Z',
    followUp:
      'Provide the relevant assessment records and explain the competency verification process.',
    response: '',
  },
  {
    id: 'feedback-002',
    subject: 'Training session progress',
    message:
      'The training progress report is well structured. Continue monitoring mentees who need additional practical support.',
    direction: 'Received',
    status: 'In Progress',
    category: 'Training',
    sender: 'County Mentor',
    cohortId: 'cohort-002',
    cohortName: 'Cohort B',
    createdAt: '2026-11-05T11:00:00.000Z',
    followUp:
      'Continue documenting coaching sessions and mentee progress.',
    response: 'Additional coaching sessions have been scheduled.',
  },
  {
    id: 'feedback-003',
    subject: 'Request for additional learning resources',
    message:
      'Some mentees would benefit from additional learning materials covering emergency obstetric care procedures.',
    direction: 'Received',
    status: 'Resolved',
    category: 'Support',
    sender: 'County Mentor',
    cohortId: 'cohort-003',
    cohortName: 'Cohort C',
    createdAt: '2026-11-03T08:15:00.000Z',
    followUp:
      'Identify suitable learning materials and share them with the cohort.',
    response:
      'The relevant learning resources have been shared with the cohort.',
  },
  {
    id: 'feedback-004',
    subject: 'Cohort training schedule update',
    message:
      'I would like to provide an update on the revised practical training schedule for this cohort.',
    direction: 'Sent',
    status: 'In Progress',
    category: 'Cohort',
    sender: 'County Mentor',
    cohortId: 'cohort-001',
    cohortName: 'Cohort A',
    createdAt: '2026-11-02T13:45:00.000Z',
    followUp: 'Awaiting review of the proposed schedule.',
    response: '',
  },
  {
    id: 'feedback-005',
    subject: 'Clarification on learning plan',
    message:
      'Please clarify the sequencing of theory and practical sessions in the current learning plan.',
    direction: 'Received',
    status: 'Pending',
    category: 'Training',
    sender: 'County Mentor',
    cohortId: 'cohort-004',
    cohortName: 'Cohort D',
    createdAt: '2026-11-01T10:00:00.000Z',
    followUp:
      'Provide an explanation of the learning plan and training sequence.',
    response: '',
  },
  {
    id: 'feedback-006',
    subject: 'Mentee support requirements',
    message:
      'I have submitted a request for additional support for mentees who require more practical coaching.',
    direction: 'Sent',
    status: 'Pending',
    category: 'Support',
    sender: 'County Mentor',
    cohortId: 'cohort-004',
    cohortName: 'Cohort D',
    createdAt: '2026-10-30T14:20:00.000Z',
    followUp: 'Awaiting feedback on the support request.',
    response: '',
  },
]
