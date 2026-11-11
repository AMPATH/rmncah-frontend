import {
  cohortRepository,
  facilityRepository,
  learningPlanModuleRepository,
  learningPlanRepository,
  learningSessionRepository,
  menteeRepository,
  mentorRepository,
} from '../../../core/data/repositories'

import type {
  CohortDirectoryRecord,
  CohortSummaryData,
} from '../types/cohort-management.types'

export const cohortManagementService = {
  getAll(): CohortDirectoryRecord[] {
    const cohorts = cohortRepository.getAll()
    const facilities = facilityRepository.getAll()
    const mentors = mentorRepository.getAll()
    const mentees = menteeRepository.getAll()
    const learningPlans = learningPlanRepository.getAll()
    const learningPlanModules =
      learningPlanModuleRepository.getAll()
    const learningSessions = learningSessionRepository.getAll()

    return cohorts.map((cohort) => {
      const facility = facilities.find(
        (item) => item.id === cohort.facilityId,
      )

      const mentor = cohort.mentorId
        ? mentors.find((item) => item.id === cohort.mentorId)
        : undefined

      const cohortMentees = mentees.filter(
        (mentee) => mentee.cohortId === cohort.id,
      )

      const completedCount = cohortMentees.filter(
        (mentee) => mentee.competencyStatus === 'Competent',
      ).length

      const inProgressCount = cohortMentees.filter(
        (mentee) => mentee.competencyStatus === 'In Progress',
      ).length

      const needsSupportCount = cohortMentees.filter(
        (mentee) => mentee.competencyStatus === 'Needs Support',
      ).length

      const menteesCount = cohortMentees.length

      const progress =
        menteesCount > 0
          ? Math.round((completedCount / menteesCount) * 100)
          : 0

      const cohortPlans = learningPlans.filter(
        (plan) => plan.cohortId === cohort.id,
      )

      const cohortPlanIds = cohortPlans.map(
        (plan) => plan.id,
      )

      const trainingModules = learningPlanModules
        .filter((module) =>
          cohortPlanIds.includes(module.learningPlanId),
        )
        .map((module) => module.title)

      const nextSession = learningSessions
        .filter(
          (session) =>
            cohortPlanIds.includes(session.learningPlanId) &&
            session.status === 'Scheduled' &&
            session.scheduledDate >=
              new Date().toISOString().slice(0, 10),
        )
        .sort((a, b) =>
          a.scheduledDate.localeCompare(b.scheduledDate),
        )[0]

      return {
        ...cohort,
        facilityName: facility?.name ?? 'Facility not assigned',
        mentorName: mentor?.name ?? null,
        menteesCount,
        completedCount,
        inProgressCount,
        needsSupportCount,
        progress,
        trainingModules: [...new Set(trainingModules)],
        nextSession: nextSession?.scheduledDate ?? null,
      }
    })
  },

  getSummary(
    cohorts: CohortDirectoryRecord[],
  ): CohortSummaryData {
    return {
      totalCohorts: cohorts.length,

      activeCohorts: cohorts.filter(
        (cohort) => cohort.status === 'Active',
      ).length,

      completedCohorts: cohorts.filter(
        (cohort) => cohort.status === 'Completed',
      ).length,

      pausedCohorts: cohorts.filter(
        (cohort) => cohort.status === 'Paused',
      ).length,

      totalMentees: cohorts.reduce(
        (total, cohort) => total + cohort.menteesCount,
        0,
      ),
    }
  },
}