
import { LocalStorageAdapter } from '../storage/local-storage.adapter'
import { LocalRepository } from './base.repository'
import { REPOSITORY_KEYS } from './repository-keys'

import type {
  Facility,
  Mentor,
  Cohort,
  Mentee,
  TrainingModule,
  TrainingSection,
  LearningMaterial,
  LearningPlan,
  LearningPlanModule,
  LearningSession,
  Assessment,
  CohortSubmission,
  SiteAssessment,
  SiteAssessmentFinding,
  Feedback,
  FeedbackResponse,
} from '../models'

const storage = new LocalStorageAdapter()

export const facilityRepository =
  new LocalRepository<Facility>(
    storage,
    REPOSITORY_KEYS.facilities,
  )

export const mentorRepository =
  new LocalRepository<Mentor>(
    storage,
    REPOSITORY_KEYS.mentors,
  )

export const cohortRepository =
  new LocalRepository<Cohort>(
    storage,
    REPOSITORY_KEYS.cohorts,
  )

export const menteeRepository =
  new LocalRepository<Mentee>(
    storage,
    REPOSITORY_KEYS.mentees,
  )

export const trainingModuleRepository =
  new LocalRepository<TrainingModule>(
    storage,
    REPOSITORY_KEYS.trainingModules,
  )

export const trainingSectionRepository =
  new LocalRepository<TrainingSection>(
    storage,
    REPOSITORY_KEYS.trainingSections,
  )

export const learningMaterialRepository =
  new LocalRepository<LearningMaterial>(
    storage,
    REPOSITORY_KEYS.learningMaterials,
  )

export const learningPlanRepository =
  new LocalRepository<LearningPlan>(
    storage,
    REPOSITORY_KEYS.learningPlans,
  )

export const learningPlanModuleRepository =
  new LocalRepository<LearningPlanModule>(
    storage,
    REPOSITORY_KEYS.learningPlanModules,
  )

export const learningSessionRepository =
  new LocalRepository<LearningSession>(
    storage,
    REPOSITORY_KEYS.learningSessions,
  )

export const assessmentRepository =
  new LocalRepository<Assessment>(
    storage,
    REPOSITORY_KEYS.assessments,
  )

  export const siteAssessmentRepository =
  new LocalRepository<SiteAssessment>(
    storage,
    REPOSITORY_KEYS.siteAssessments,
  )

export const siteAssessmentFindingRepository =
  new LocalRepository<SiteAssessmentFinding>(
    storage,
    REPOSITORY_KEYS.siteAssessmentFindings,
  )

  export const feedbackRepository =
  new LocalRepository<Feedback>(
    storage,
    REPOSITORY_KEYS.feedback,
  )

export const feedbackResponseRepository =
  new LocalRepository<FeedbackResponse>(
    storage,
    REPOSITORY_KEYS.feedbackResponses,
  )

export const cohortSubmissionRepository =
  new LocalRepository<CohortSubmission>(
    storage,
    REPOSITORY_KEYS.cohortSubmissions,
  )
