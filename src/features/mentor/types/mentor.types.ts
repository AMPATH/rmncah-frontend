
export interface MentorStatistic {
  id: string
  label: string
  value: number
  description: string
}

export interface CohortProgressItem {
  id: string
  name: string
  facility: string
  menteesCount: number
  completedCount: number
  inProgressCount: number
  needsSupportCount: number
  progress: number
}

export interface UpcomingSession {
  id: string
  title: string
  cohort: string
  facility: string
  date: string
  time: string
  sessionType: 'Theory' | 'Practical' | 'Assessment' | 'Coaching'
  location: string
}

export interface MenteeAttentionItem {
  id: string
  name: string
  cohort: string
  facility: string
  issue: string
  priority: 'High' | 'Medium' | 'Low'
  lastActivity: string
}

export interface MentorActivity {
  id: string
  description: string
  target: string
  timestamp: string
  type: 'assessment' | 'training' | 'cohort' | 'mentee' | 'submission'
}

export interface MentorDashboardData {
  statistics: MentorStatistic[]
  cohorts: CohortProgressItem[]
  upcomingSessions: UpcomingSession[]
  menteesNeedingAttention: MenteeAttentionItem[]
  recentActivities: MentorActivity[]
}

/**
 * Mentor My Cohorts
 */
export interface MentorCohort {
  id: string
  name: string
  facility: string
  menteesCount: number
  completedCount: number
  inProgressCount: number
  needsSupportCount: number
  progress: number
  status: 'Active' | 'Completed' | 'Paused'
  startDate: string
  endDate: string
  trainingModules: string[]
  nextSession: string | null
  description: string
}

/**
 * Mentor Mentees
 */
export type MenteeCompetencyStatus =
  | 'Competent'
  | 'In Progress'
  | 'Needs Support'

export interface MentorMentee {
  id: string
  name: string
  email: string
  facility: string
  cohort: string
  role: string
  modulesAssigned: number
  modulesCompleted: number
  competencyStatus: MenteeCompetencyStatus
  lastActivity: string
  progress: number
  supportNotes: string
}

export interface MenteeSummaryItem {
  label: string
  value: number
  description: string
}

/**
 * Mentor Learning Plan
 */
export type LearningPlanStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Completed'
  | 'Needs Attention'

export type LearningModuleStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Completed'
  | 'Needs Support'

export type LearningSessionType =
  | 'Theory'
  | 'Practical'
  | 'Assessment'
  | 'Coaching'

export interface LearningPlanModule {
  id: string
  title: string
  description: string
  sectionsCount: number
  completedSections: number
  status: LearningModuleStatus
  competencyRequired: boolean
  competencyAchieved: boolean
}

export interface LearningPlanSession {
  id: string
  title: string
  moduleTitle: string
  sessionType: LearningSessionType
  scheduledDate: string
  startTime: string
  endTime: string
  location: string
  status: 'Scheduled' | 'Completed' | 'Rescheduled' | 'Cancelled'
}

export interface MentorLearningPlan {
  id: string
  title: string
  cohortId: string
  cohortName: string
  facility: string
  startDate: string
  endDate: string
  status: LearningPlanStatus
  modules: LearningPlanModule[]
  sessions: LearningPlanSession[]
  description: string
}

export interface LearningPlanSummary {
  totalPlans: number
  activePlans: number
  completedPlans: number
  modulesRequiringSupport: number
}

/**
 * Mentor Assessments
 */
export type MentorAssessmentType =
  | 'Theory'
  | 'Practical'

export type MentorAssessmentStatus =
  | 'Scheduled'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled'

export type MentorAssessmentOutcome =
  | 'Competent'
  | 'Needs Support'
  | 'Pending'

export interface MentorAssessment {
  id: string
  menteeId: string
  menteeName: string
  cohortId: string
  cohortName: string
  facility: string
  moduleTitle: string
  assessmentType: MentorAssessmentType
  scheduledDate: string
  assessor: string
  status: MentorAssessmentStatus
  outcome: MentorAssessmentOutcome
  notes: string
  followUpRequired: boolean
}

export interface MentorAssessmentSummary {
  totalAssessments: number
  scheduledAssessments: number
  completedAssessments: number
  menteesNeedingSupport: number
}

export interface MentorAssessmentFormValues {
  status: MentorAssessmentStatus
  outcome: MentorAssessmentOutcome
  notes: string
  followUpRequired: boolean
}


/**
 * Mentor Resources
 */

export type MentorResourceType =
  | 'E-book'
  | 'Slides'
  | 'Video'

export interface MentorResource {
  id: string
  title: string
  description: string
  type: MentorResourceType
  moduleTitle: string
  sectionTitle: string
  fileName: string
  fileUrl: string
  publishedDate: string
  fileSize: string
  duration?: string
}

export interface MentorResourceCategory {
  id: string
  title: string
  resourceCount: number
}


/**
 * Mentor Cohort Submissions
 */

export type CohortSubmissionStatus =
  | 'Not Ready'
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Returned'
  | 'Approved'

export interface MentorCohortSubmission {
  id: string
  cohortId: string
  cohortName: string
  facility: string
  mentorName: string
  menteesCount: number
  competentMentees: number
  completedModules: number
  totalModules: number
  completionPercentage: number
  status: CohortSubmissionStatus
  mentorNotes: string
  submittedAt: string | null
  reviewedAt: string | null
  reviewer: string | null
  reviewFeedback: string
}
