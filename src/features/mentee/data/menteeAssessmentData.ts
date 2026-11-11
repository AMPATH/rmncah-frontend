
import { mentorAssessmentsData } from '../../mentor/data/mentorAssessmentsData'
import { menteeOverviewData } from './menteeOverviewData'

export const menteeAssessmentData = mentorAssessmentsData
  .filter(
    (assessment) =>
      assessment.menteeId === menteeOverviewData.mentee.id,
  )
  .sort((a, b) =>
    b.scheduledDate.localeCompare(a.scheduledDate),
  )
