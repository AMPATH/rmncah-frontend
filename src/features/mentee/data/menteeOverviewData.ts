
import { mentorMenteesData } from '../../mentor/data/mentorMenteesData'
import { mentorLearningPlanData } from '../../mentor/data/mentorLearningPlanData'
import { mentorAssessmentsData } from '../../mentor/data/mentorAssessmentsData'

// Temporary demo mentee until authenticated mentee data is connected.
const DEMO_MENTEE_ID = 'mentee-001'

// Find the demo mentee.
const mentee = mentorMenteesData.find(
  (item) => item.id === DEMO_MENTEE_ID,
)

if (!mentee) {
  throw new Error(`Demo mentee not found: ${DEMO_MENTEE_ID}`)
}

// Find the learning plan assigned to the mentee's cohort.
const learningPlan = mentorLearningPlanData.find(
  (plan) => plan.cohortName === mentee.cohort,
)

// Find assessments belonging to this mentee.
const assessments = mentorAssessmentsData.filter(
  (assessment) => assessment.menteeId === mentee.id,
)

// Get today's date in local YYYY-MM-DD format.
function getLocalDateKey(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const today = getLocalDateKey()

// Learning modules.
const modules = learningPlan?.modules ?? []

// Calculate section progress.
const totalSections = modules.reduce(
  (total, module) => total + module.sectionsCount,
  0,
)

const completedSections = modules.reduce(
  (total, module) => total + module.completedSections,
  0,
)

// Get upcoming scheduled sessions.
const upcomingSessions = (learningPlan?.sessions ?? [])
  .filter(
    (session) =>
      session.scheduledDate >= today &&
      session.status === 'Scheduled',
  )
  .sort((a, b) =>
    a.scheduledDate.localeCompare(b.scheduledDate),
  )

// Get the most recently scheduled assessment.
const latestAssessment = [...assessments].sort(
  (a, b) =>
    b.scheduledDate.localeCompare(a.scheduledDate),
)[0]

// Export overview data for the Mentee Overview page.
export const menteeOverviewData = {
  mentee: {
    id: mentee.id,
    name: mentee.name,
    role: mentee.role,
    facility: mentee.facility,
    cohort: mentee.cohort,
    competencyStatus: mentee.competencyStatus,
  },

  learning: {
    planTitle: learningPlan?.title ?? 'No learning plan assigned',
    modules,
    totalModules: modules.length,

    completedModules: modules.filter(
      (module) => module.status === 'Completed',
    ).length,

    totalSections,
    completedSections,

    progress:
      totalSections > 0
        ? Math.round((completedSections / totalSections) * 100)
        : 0,
  },

  upcomingSessions,

  assessments: {
    total: assessments.length,

    completed: assessments.filter(
      (assessment) => assessment.status === 'Completed',
    ).length,

    pending: assessments.filter(
      (assessment) =>
        assessment.status === 'Scheduled' ||
        assessment.status === 'In Progress',
    ).length,

    latest: latestAssessment
      ? {
          moduleTitle: latestAssessment.moduleTitle,
          assessmentType: latestAssessment.assessmentType,
          scheduledDate: latestAssessment.scheduledDate,
          status: latestAssessment.status,
          outcome: latestAssessment.outcome,
        }
      : null,
  },
}
