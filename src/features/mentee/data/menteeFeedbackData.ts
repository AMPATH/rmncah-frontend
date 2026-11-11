
import {
  mentorMenteesData,
} from '../../mentor/data/mentorMenteesData'

import {
  mentorAssessmentsData,
} from '../../mentor/data/mentorAssessmentsData'

export type MenteeFeedbackCategory =
  | 'Assessment'
  | 'Mentor observation'

export interface MenteeFeedback {
  id: string
  title: string
  message: string
  category: MenteeFeedbackCategory
  source: string
  author: string
  moduleTitle: string | null
  date: string | null
  outcome: 'Competent' | 'Needs Support' | 'Pending' | null
  followUpRequired: boolean
}

// Temporary demonstration mentee.
// This should eventually come from the authenticated mentee account.
const DEMO_MENTEE_ID = 'mentee-001'

const mentee = mentorMenteesData.find(
  (item) => item.id === DEMO_MENTEE_ID,
)

if (!mentee) {
  throw new Error(`Demo mentee not found: ${DEMO_MENTEE_ID}`)
}

// Only retrieve assessment records belonging to this mentee.
const menteeAssessments = mentorAssessmentsData.filter(
  (assessment) =>
    assessment.menteeId === mentee.id &&
    assessment.status === 'Completed',
)

// Convert completed assessment notes into feedback records.
const assessmentFeedback: MenteeFeedback[] =
  menteeAssessments.map((assessment) => ({
    id: `assessment-feedback-${assessment.id}`,
    title: `${assessment.assessmentType} assessment feedback`,
    message: assessment.notes,
    category: 'Assessment',
    source: 'Competency assessment',
    author: assessment.assessor,
    moduleTitle: assessment.moduleTitle,
    date: assessment.scheduledDate,
    outcome: assessment.outcome,
    followUpRequired: assessment.followUpRequired,
  }))

// Use the existing mentor support note.
// The source data does not provide a date for this observation.
const mentorObservation: MenteeFeedback[] =
  mentee.supportNotes.trim()
    ? [
        {
          id: `mentor-observation-${mentee.id}`,
          title: 'Mentor progress observation',
          message: mentee.supportNotes,
          category: 'Mentor observation',
          source: 'Mentee progress record',
          author: 'Assigned mentor',
          moduleTitle: null,
          date: null,
          outcome: null,
          followUpRequired: false,
        },
      ]
    : []

// Combine the available feedback and sort dated records first.
export const menteeFeedbackData = [
  ...assessmentFeedback,
  ...mentorObservation,
].sort((a, b) => {
  if (!a.date) return 1
  if (!b.date) return -1

  return b.date.localeCompare(a.date)
})

// Information used by the Feedback page summary.
export const menteeFeedbackProfile = {
  name: mentee.name,
  cohort: mentee.cohort,
  facility: mentee.facility,
  competencyStatus: mentee.competencyStatus,
}
