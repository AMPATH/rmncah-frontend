
import type { MentorAssessment } from '../types/mentor.types'

import { mentorMenteesData } from './mentorMenteesData'
import { mentorCohortsData } from './mentorCohortsData'

const assessmentStatuses: MentorAssessment['status'][] = [
  'Completed',
  'Completed',
  'Scheduled',
  'In Progress',
  'Completed',
  'Scheduled',
  'Completed',
  'In Progress',
]

const assessmentOutcomes: MentorAssessment['outcome'][] = [
  'Competent',
  'Needs Support',
  'Pending',
  'Pending',
  'Competent',
  'Pending',
  'Competent',
  'Needs Support',
]

const assessmentTypes: MentorAssessment['assessmentType'][] = [
  'Practical',
  'Theory',
  'Practical',
  'Theory',
  'Practical',
  'Theory',
  'Practical',
  'Theory',
]

const assessmentDates = [
  '2026-11-03',
  '2026-11-04',
  '2026-11-09',
  '2026-11-10',
  '2026-11-05',
  '2026-11-12',
  '2026-11-06',
  '2026-11-13',
]

export const mentorAssessmentsData: MentorAssessment[] =
  mentorMenteesData.map((mentee, index) => {
    const cohort = mentorCohortsData.find(
      (item) => item.name === mentee.cohort,
    )

    const status = assessmentStatuses[index % assessmentStatuses.length]
    const outcome = assessmentOutcomes[index % assessmentOutcomes.length]

    const moduleTitle =
      cohort?.trainingModules[index % (cohort.trainingModules.length || 1)] ??
      'Emergency Obstetric and Newborn Care'

    return {
      id: `assessment-${String(index + 1).padStart(3, '0')}`,
      menteeId: mentee.id,
      menteeName: mentee.name,
      cohortId: cohort?.id ?? '',
      cohortName: mentee.cohort,
      facility: mentee.facility,
      moduleTitle,
      assessmentType: assessmentTypes[index % assessmentTypes.length],
      scheduledDate: assessmentDates[index % assessmentDates.length],
      assessor: 'Assigned Mentor',
      status,
      outcome,
      notes:
        outcome === 'Needs Support'
          ? 'Additional coaching and reassessment are recommended.'
          : outcome === 'Competent'
            ? 'Required competency demonstrated during assessment.'
            : 'Assessment outcome is awaiting review.',
      followUpRequired: outcome === 'Needs Support',
    }
  })
