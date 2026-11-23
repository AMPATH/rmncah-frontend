import {
  facilityRepository,
  mentorRepository,
  cohortRepository,
  menteeRepository,
  learningPlanRepository,
  learningPlanModuleRepository,
  learningSessionRepository,
  assessmentRepository,
  cohortSubmissionRepository,
  siteAssessmentRepository,
  siteAssessmentFindingRepository,
} from '../repositories'

import {
  initialFacilities,
  initialMentors,
  initialCohorts,
  initialMentees,
  initialLearningPlans,
  initialLearningPlanModules,
  initialLearningSessions,
  initialAssessments,
  initialCohortSubmissions,
  initialSiteAssessments,
  initialSiteAssessmentFindings,
} from './initial-demo-data'

interface SeedableRepository<T> {
  getAll(): T[]
  replaceAll(records: T[]): void
}

/**
 * Seeds a repository only when it is empty.
 *
 * Existing browser data is never overwritten.
 */
function seedIfEmpty<T>(
  repository: SeedableRepository<T>,
  records: T[],
): number {
  if (repository.getAll().length > 0) {
    return 0
  }

  repository.replaceAll(records)

  return records.length
}

export interface SeedResult {
  facilities: number
  mentors: number
  cohorts: number
  mentees: number
  learningPlans: number
  learningPlanModules: number
  learningSessions: number
  assessments: number
  cohortSubmissions: number
  siteAssessments: number
  siteAssessmentFindings: number
}

/**
 * Initialize local demo data.
 *
 * This function is intentionally not called automatically here.
 * The application entry point will decide when to initialize it.
 */
export function initializeDemoData(): SeedResult {
  return {
    facilities: seedIfEmpty(
      facilityRepository,
      initialFacilities,
    ),

    mentors: seedIfEmpty(
      mentorRepository,
      initialMentors,
    ),

    cohorts: seedIfEmpty(
      cohortRepository,
      initialCohorts,
    ),

    mentees: seedIfEmpty(
      menteeRepository,
      initialMentees,
    ),

    learningPlans: seedIfEmpty(
      learningPlanRepository,
      initialLearningPlans,
    ),

    learningPlanModules: seedIfEmpty(
      learningPlanModuleRepository,
      initialLearningPlanModules,
    ),

    learningSessions: seedIfEmpty(
      learningSessionRepository,
      initialLearningSessions,
    ),

    assessments: seedIfEmpty(
      assessmentRepository,
      initialAssessments,
    ),

    cohortSubmissions: seedIfEmpty(
      cohortSubmissionRepository,
      initialCohortSubmissions,
    ),

    siteAssessments: seedIfEmpty(
      siteAssessmentRepository,
      initialSiteAssessments,
    ),

    siteAssessmentFindings: seedIfEmpty(
      siteAssessmentFindingRepository,
      initialSiteAssessmentFindings,
    ),
  }
}