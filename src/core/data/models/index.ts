
/**
 * Shared data models for the EmONC Mentorship Training System.
 *
 * These models define the frontend data contract.
 * The backend API can later implement the same entities and relationships.
 */

// ============================================================
// BASE
// ============================================================

export interface BaseRecord {
  id: string
  createdAt: string
  updatedAt: string
}

export type RecordStatus = 'Active' | 'Inactive'

// ============================================================
// FACILITIES
// ============================================================

export interface Facility extends BaseRecord {
  name: string
  county: string
  subCounty?: string
  facilityCode?: string
  status: RecordStatus
}

// ============================================================
// MENTORS
// ============================================================

/**
 * A Mentor is a person who conducts mentorship and may be
 * assigned to manage cohorts.
 *
 * This is NOT the County Mentor / RH / MOH oversight user.
 */
export interface Mentor extends BaseRecord {
  name: string
  email?: string
  phone?: string
  facilityId: string
  county: string
  professionalRole: string
  specialty: string
  status: RecordStatus
}

// ============================================================
// COHORTS
// ============================================================

export type CohortStatus =
  | 'Active'
  | 'Completed'
  | 'Paused'

export interface Cohort extends BaseRecord {
  name: string
  facilityId: string

  /**
   * Null means that no confirmed mentor assignment
   * is currently available in the data.
   */
  mentorId: string | null

  startDate: string
  endDate: string
  status: CohortStatus
  description: string
}

// ============================================================
// MENTEES
// ============================================================

export type MenteeCompetencyStatus =
  | 'Competent'
  | 'In Progress'
  | 'Needs Support'

export interface Mentee extends BaseRecord {
  name: string
  email: string
  phone?: string
  facilityId: string
  cohortId: string
  professionalRole: string
  competencyStatus: MenteeCompetencyStatus
  status: RecordStatus
  supportNotes: string
}

// ============================================================
// PROGRAM LEAD: TRAINING CONTENT
// ============================================================

export type TrainingModuleStatus =
  | 'Draft'
  | 'Published'
  | 'Incomplete content'

export interface TrainingModule extends BaseRecord {
  title: string
  category: string
  description: string
  status: TrainingModuleStatus
  publishedAt?: string | null
}

export interface TrainingSection extends BaseRecord {
  moduleId: string
  title: string
  description: string
  sequence: number
}

export type LearningMaterialType =
  | 'E-book'
  | 'Slides'
  | 'Video'

export interface LearningMaterial extends BaseRecord {
  moduleId: string
  sectionId: string
  title: string
  description: string
  type: LearningMaterialType
  fileName: string
  fileSize: string

  /**
   * Resource location or URL.
   * Actual file storage will be handled by the backend
   * or an external file-storage service.
   */
  resourceUrl: string
}

// ============================================================
// MENTOR: LEARNING PLANS
// ============================================================

export type LearningPlanStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Completed'
  | 'Needs Attention'
  | 'Paused'

export interface LearningPlan extends BaseRecord {
  title: string
  cohortId: string
  startDate: string
  endDate: string
  status: LearningPlanStatus
  description: string
}

/**
 * These are the learning-plan modules used by mentors.
 *
 * They remain separate from Program Lead TrainingModule
 * records until a confirmed catalogue relationship exists.
 */
export type LearningPlanModuleStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Completed'
  | 'Needs Support'

  
export interface LearningPlanModule extends BaseRecord {
  learningPlanId: string
  title: string
  description: string
  sectionsCount: number
  completedSections: number
  status: LearningPlanModuleStatus
  competencyRequired: boolean
  competencyAchieved: boolean

  /**
   * Optional link to a Program Lead module.
   * Null means the relationship has not been confirmed.
   */
  trainingModuleId: string | null
}

// ============================================================
// MENTOR: LEARNING SESSIONS
// ============================================================

export type LearningSessionType =
  | 'Theory'
  | 'Practical'
  | 'Assessment'
  | 'Coaching'

export type LearningSessionStatus =
  | 'Scheduled'
  | 'Completed'
  | 'Rescheduled'
  | 'Cancelled'

export interface LearningSession extends BaseRecord {
  learningPlanId: string
  learningPlanModuleId: string | null
  title: string
  sessionType: LearningSessionType
  scheduledDate: string
  startTime: string
  endTime: string
  location: string
  status: LearningSessionStatus
}

// ============================================================
// MENTOR: ASSESSMENTS
// ============================================================

export type AssessmentType =
  | 'Theory'
  | 'Practical'

export type AssessmentStatus =
  | 'Scheduled'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled'

export type AssessmentOutcome =
  | 'Competent'
  | 'Needs Support'
  | 'Pending'

export interface Assessment extends BaseRecord {
  menteeId: string
  cohortId: string
  moduleTitle: string
  assessmentType: AssessmentType
  scheduledDate: string
  status: AssessmentStatus
  outcome: AssessmentOutcome

  /**
   * Null when the actual assessor identity
   * has not yet been established.
   */
  assessorId: string | null
  assessorName: string

  notes: string
  followUpRequired: boolean
}

// ============================================================
// MENTOR: COHORT SUBMISSIONS
// ============================================================

export type CohortSubmissionStatus =
  | 'Not Ready'
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Returned'
  | 'Approved'

export interface CohortSubmission extends BaseRecord {
  cohortId: string
  mentorId: string | null
  status: CohortSubmissionStatus
  mentorNotes: string
  submittedAt: string | null
  reviewedAt: string | null

  /**
   * County Mentor / RH / MOH reviewer.
   * Null until a reviewer is confirmed.
   */
  reviewerId: string | null
  reviewerName: string | null

  reviewFeedback: string
}


// ============================================================
// COUNTY MENTOR: SITE ASSESSMENTS
// ============================================================

export type SiteAssessmentStatus =
  | 'Scheduled'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled'

export interface SiteAssessment extends BaseRecord {
  facilityId: string
  assessmentDate: string

  assessorId: string | null
  assessorName: string

  status: SiteAssessmentStatus

  summary: string
  nextFollowUpDate: string | null
}

export type SiteAssessmentFindingStatus =
  | 'Open'
  | 'In Progress'
  | 'Resolved'
  | 'Deferred'

export interface SiteAssessmentFinding extends BaseRecord {
  siteAssessmentId: string

  title: string
  description: string

  assignedTo: string
  dueDate: string | null

  status: SiteAssessmentFindingStatus

  resolutionNotes: string
}



// ============================================================
// SHARED: FEEDBACK AND CHALLENGES
// ============================================================

export type FeedbackDirection =
  | 'Received'
  | 'Sent'

export type FeedbackCategory =
  | 'Training'
  | 'Assessment'
  | 'Cohort'
  | 'Support'
  | 'Facility'
  | 'General'

export type FeedbackStatus =
  | 'Pending'
  | 'In Progress'
  | 'Resolved'

export type FeedbackPriority =
  | 'Low'
  | 'Medium'
  | 'High'
  | 'Urgent'

export type FeedbackRecordType =
  | 'Feedback'
  | 'Challenge'

export type FeedbackUserRole =
  | 'Program Lead'
  | 'County Mentor'
  | 'Mentor'
  | 'Mentee'
  | 'Developer / System Administrator'

export interface Feedback extends BaseRecord {
  subject: string
  message: string

  recordType: FeedbackRecordType
  category: FeedbackCategory
  direction: FeedbackDirection
  status: FeedbackStatus
  priority: FeedbackPriority

  senderId: string | null
  senderName: string
  senderRole: FeedbackUserRole

  recipientId: string | null
  recipientName: string
  recipientRole: FeedbackUserRole

  facilityId: string | null
  cohortId: string | null

  assignedToId: string | null
  assignedToName: string | null

  followUp: string
  dueDate: string | null

  resolvedAt: string | null
  resolutionNotes: string
}

export interface FeedbackResponse extends BaseRecord {
  feedbackId: string

  responderId: string | null
  responderName: string
  responderRole: FeedbackUserRole

  message: string
}