import { mentorLearningPlanData } from '../../mentor/data/mentorLearningPlanData'
import { menteeOverviewData } from './menteeOverviewData'

const mentee = menteeOverviewData.mentee

// Find the learning plan assigned to this Mentee's cohort.
const learningPlan = mentorLearningPlanData.find(
  (plan) => plan.cohortName === mentee.cohort,
)

export const menteeScheduleData = {
  mentee,

  planTitle: learningPlan?.title ?? 'No learning plan assigned',

  sessions: [...(learningPlan?.sessions ?? [])].sort((a, b) => {
    const dateComparison = a.scheduledDate.localeCompare(b.scheduledDate)

    if (dateComparison !== 0) {
      return dateComparison
    }

    return a.startTime.localeCompare(b.startTime)
  }),
}