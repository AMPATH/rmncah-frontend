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
} from '../models'

import { countyMentorsData } from '../../../features/county-mentor/data/countyMentorsData'

import { mentorCohortsData } from '../../../features/mentor/data/mentorCohortsData'
import { mentorMenteesData } from '../../../features/mentor/data/mentorMenteesData'
import { mentorAssessmentsData } from '../../../features/mentor/data/mentorAssessmentsData'
import { mentorLearningPlanData } from '../../../features/mentor/data/mentorLearningPlanData'
import { mentorCohortSubmissionsData } from '../../../features/mentor/data/mentorCohortSubmissionsData'

import { programModules } from '../../../features/program-lead/data/programLeadDashboardData'
import { initialModuleSections } from '../../../features/program-lead/data/moduleSectionsData'
import { initialLearningMaterials } from '../../../features/program-lead/data/learningMaterialsData'

/**
 * Fixed timestamp for demo records that do not have
 * an original creation or update timestamp.
 */
const DEMO_TIMESTAMP = '2026-11-09T00:00:00.000Z'

const toTimestamp = (date?: string | null): string => {
  if (!date) return DEMO_TIMESTAMP

  // Already an ISO timestamp.
  if (date.includes('T')) {
    return date
  }

  // Convert dates such as 2026-11-08.
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return `${date}T00:00:00.000Z`
  }

  // Convert dates such as 08 Nov 2026.
  const parsed = new Date(date)

  return Number.isNaN(parsed.getTime())
    ? DEMO_TIMESTAMP
    : parsed.toISOString()
}

const createFacilityId = (name: string): string =>
  `facility-${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}`

// ============================================================
// FACILITIES
// ============================================================

const cohortFacilityNames = mentorCohortsData.map(
  (cohort) => cohort.facility,
)

const mentorFacilityNames = countyMentorsData.map(
  (mentor) => mentor.facility,
)

const allFacilityNames = [
  ...new Set([
    ...cohortFacilityNames,
    ...mentorFacilityNames,
  ]),
]

const mentorFacilityCounty = new Map(
  countyMentorsData.map((mentor) => [
    mentor.facility,
    mentor.county,
  ]),
)

export const initialFacilities: Facility[] =
  allFacilityNames.map((name) => ({
    id: createFacilityId(name),
    name,
    county: mentorFacilityCounty.get(name) ?? 'Not specified',
    status: 'Active',
    createdAt: DEMO_TIMESTAMP,
    updatedAt: DEMO_TIMESTAMP,
  }))

// ============================================================
// MENTORS
// ============================================================

export const initialMentors: Mentor[] =
  countyMentorsData.map((mentor) => ({
    id: mentor.id,
    name: mentor.name,
    email: mentor.email,
    phone: mentor.phone,
    facilityId: createFacilityId(mentor.facility),
    county: mentor.county,
    professionalRole: mentor.professionalRole,
    specialty: mentor.specialty,
    status: mentor.status,
    createdAt: toTimestamp(mentor.dateAdded),
    updatedAt: toTimestamp(mentor.dateAdded),
  }))

// ============================================================
// COHORTS
// ============================================================

export const initialCohorts: Cohort[] =
  mentorCohortsData.map((cohort) => ({
    id: cohort.id,
    name: cohort.name,
    facilityId: createFacilityId(cohort.facility),

    // No confirmed mentor-to-cohort assignment exists
    // in the current source data.
    mentorId: null,

    startDate: cohort.startDate,
    endDate: cohort.endDate,
    status: cohort.status,
    description: cohort.description,
    createdAt: toTimestamp(cohort.startDate),
    updatedAt: DEMO_TIMESTAMP,
  }))

// ============================================================
// MENTEES
// ============================================================

const cohortIdByName = new Map(
  initialCohorts.map((cohort) => [
    cohort.name,
    cohort.id,
  ]),
)

export const initialMentees: Mentee[] =
  mentorMenteesData.map((mentee) => {
    const cohortId = cohortIdByName.get(mentee.cohort)

    if (!cohortId) {
      throw new Error(
        `Cannot seed mentee "${mentee.name}": cohort "${mentee.cohort}" was not found.`,
      )
    }

    return {
      id: mentee.id,
      name: mentee.name,
      email: mentee.email,
      facilityId: createFacilityId(mentee.facility),
      cohortId,
      professionalRole: mentee.role,
      competencyStatus: mentee.competencyStatus,
      status: 'Active',
      supportNotes: mentee.supportNotes,
      createdAt: DEMO_TIMESTAMP,
      updatedAt: toTimestamp(mentee.lastActivity),
    }
  })

// ============================================================
// PROGRAM LEAD: TRAINING MODULES
// ============================================================

export const initialTrainingModules: TrainingModule[] =
  programModules.map((module) => ({
    id: module.id,
    title: module.title,
    category: module.category,
    description: '',
    status: module.status,
    createdAt: DEMO_TIMESTAMP,
    updatedAt: toTimestamp(module.updatedAt),
  }))

// ============================================================
// PROGRAM LEAD: TRAINING SECTIONS
// ============================================================

export const initialTrainingSections: TrainingSection[] =
  initialModuleSections.map((section) => ({
    id: section.id,
    moduleId: section.moduleId,
    title: section.title,
    description: section.description,
    sequence: section.sequence,
    createdAt: DEMO_TIMESTAMP,
    updatedAt: toTimestamp(section.updatedAt),
  }))

// ============================================================
// PROGRAM LEAD: LEARNING MATERIALS
// ============================================================

export const initialLearningMaterialsData: LearningMaterial[] =
  initialLearningMaterials.map((material) => ({
    id: material.id,
    moduleId: material.moduleId,
    sectionId: material.sectionId,
    title: material.title,
    description: material.description,
    type: material.type,
    fileName: material.fileName,
    fileSize: material.fileSize,
    resourceUrl: material.resourceUrl,
    createdAt: DEMO_TIMESTAMP,
    updatedAt: toTimestamp(material.updatedAt),
  }))

// ============================================================
// MENTOR: LEARNING PLANS
// ============================================================

export const initialLearningPlans: LearningPlan[] =
  mentorLearningPlanData.map((plan) => ({
    id: plan.id,
    title: plan.title,
    cohortId: plan.cohortId,
    startDate: plan.startDate,
    endDate: plan.endDate,
    status: plan.status,
    description: plan.description,
    createdAt: toTimestamp(plan.startDate),
    updatedAt: DEMO_TIMESTAMP,
  }))

// ============================================================
// MENTOR: LEARNING PLAN MODULES
// ============================================================

export const initialLearningPlanModules: LearningPlanModule[] =
  mentorLearningPlanData.flatMap((plan) =>
    plan.modules.map((module) => ({
      id: module.id,
      learningPlanId: plan.id,
      title: module.title,
      description: module.description,
      sectionsCount: module.sectionsCount,
      completedSections: module.completedSections,
      status: module.status,
      competencyRequired: module.competencyRequired,
      competencyAchieved: module.competencyAchieved,

      // No verified link to a Program Lead module yet.
      trainingModuleId: null,

      createdAt: DEMO_TIMESTAMP,
      updatedAt: DEMO_TIMESTAMP,
    })),
  )

// ============================================================
// MENTOR: LEARNING SESSIONS
// ============================================================

export const initialLearningSessions: LearningSession[] =
  mentorLearningPlanData.flatMap((plan) =>
    plan.sessions.map((session) => {
      const matchingModule = plan.modules.find(
        (module) => module.title === session.moduleTitle,
      )

      return {
        id: session.id,
        learningPlanId: plan.id,
        learningPlanModuleId: matchingModule?.id ?? null,
        title: session.title,
        sessionType: session.sessionType,
        scheduledDate: session.scheduledDate,
        startTime: session.startTime,
        endTime: session.endTime,
        location: session.location,
        status: session.status,
        createdAt: DEMO_TIMESTAMP,
        updatedAt: DEMO_TIMESTAMP,
      }
    }),
  )

// ============================================================
// MENTOR: ASSESSMENTS
// ============================================================

export const initialAssessments: Assessment[] =
  mentorAssessmentsData.map((assessment) => ({
    id: assessment.id,
    menteeId: assessment.menteeId,
    cohortId: assessment.cohortId,
    moduleTitle: assessment.moduleTitle,
    assessmentType: assessment.assessmentType,
    scheduledDate: assessment.scheduledDate,
    status: assessment.status,
    outcome: assessment.outcome,

    // "Assigned Mentor" is a placeholder, not a real identity.
    assessorId: null,
    assessorName: assessment.assessor,

    notes: assessment.notes,
    followUpRequired: assessment.followUpRequired,
    createdAt: DEMO_TIMESTAMP,
    updatedAt: DEMO_TIMESTAMP,
  }))

// ============================================================
// MENTOR: COHORT SUBMISSIONS
// ============================================================

export const initialCohortSubmissions: CohortSubmission[] =
  mentorCohortSubmissionsData.map((submission) => ({
    id: submission.id,
    cohortId: submission.cohortId,

    // Mentor assignment is not confirmed in the source data.
    mentorId: null,

    status: submission.status,
    mentorNotes: submission.mentorNotes,
    submittedAt: submission.submittedAt,
    reviewedAt: submission.reviewedAt,

    // Reviewer name is preserved, but no reviewer user ID
    // has been supplied by the existing demo records.
    reviewerId: null,
    reviewerName: submission.reviewer,

    reviewFeedback: submission.reviewFeedback,
    createdAt: toTimestamp(submission.submittedAt),
    updatedAt: toTimestamp(
      submission.reviewedAt ?? submission.submittedAt,
    ),
  }))

// ============================================================
// COUNTY MENTOR: SITE ASSESSMENTS
// ============================================================

/**
 * No official site assessment checklist or assessment records
 * have been supplied yet.
 *
 * Keep this collection empty until the official assessment
 * template and real demo records are available.
 */
export const initialSiteAssessments: SiteAssessment[] = []

// ============================================================
// COUNTY MENTOR: SITE ASSESSMENT FINDINGS
// ============================================================

/**
 * Findings belong to a specific site assessment.
 *
 * This collection remains empty until actual assessment
 * findings and follow-up requirements are supplied.
 */
export const initialSiteAssessmentFindings: SiteAssessmentFinding[] = []