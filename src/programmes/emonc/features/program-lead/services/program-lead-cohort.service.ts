import {
  assessmentRepository,
  cohortRepository,
  cohortSubmissionRepository,
  facilityRepository,
  learningPlanModuleRepository,
  learningPlanRepository,
  learningSessionRepository,
  menteeRepository,
  mentorRepository,
} from '../../../data/repositories'

import type {
  Assessment,
  Cohort,
  CohortStatus,
  CohortSubmission,
  Facility,
  LearningPlan,
  LearningPlanModule,
  LearningSession,
  Mentee,
  Mentor,
} from '../../../data/models'

export interface ProgramLeadCohortRecord extends Cohort {
  facility: Facility | null
  mentor: Mentor | null
  mentees: Mentee[]
  menteeCount: number
  competentMentees: number
  inProgressMentees: number
  menteesNeedingSupport: number
  learningPlans: LearningPlan[]
  learningPlanModules: LearningPlanModule[]
  sessions: LearningSession[]
  assessments: Assessment[]
  submissions: CohortSubmission[]
}

export interface ProgramLeadCohortSummary {
  total: number
  active: number
  completed: number
  paused: number
  linkedMentees: number
}

class ProgramLeadCohortService {
  getAll(): ProgramLeadCohortRecord[] {
    const cohorts = cohortRepository.getAll()
    const facilities = facilityRepository.getAll()
    const mentors = mentorRepository.getAll()
    const mentees = menteeRepository.getAll()
    const plans = learningPlanRepository.getAll()
    const modules = learningPlanModuleRepository.getAll()
    const sessions = learningSessionRepository.getAll()
    const assessments = assessmentRepository.getAll()
    const submissions = cohortSubmissionRepository.getAll()

    return cohorts.map((cohort) => {
      const cohortMentees = mentees.filter(
        (mentee) => mentee.cohortId === cohort.id,
      )

      const cohortPlans = plans.filter(
        (plan) => plan.cohortId === cohort.id,
      )

      const planIds = new Set(cohortPlans.map((plan) => plan.id))

      const cohortModules = modules.filter((module) =>
        planIds.has(module.learningPlanId),
      )

      const cohortSessions = sessions
        .filter((session) => planIds.has(session.learningPlanId))
        .sort((a, b) =>
          `${a.scheduledDate}T${a.startTime}`.localeCompare(
            `${b.scheduledDate}T${b.startTime}`,
          ),
        )

      return {
        ...cohort,
        facility:
          facilities.find((facility) => facility.id === cohort.facilityId) ??
          null,
        mentor: cohort.mentorId
          ? mentors.find((mentor) => mentor.id === cohort.mentorId) ?? null
          : null,
        mentees: cohortMentees,
        menteeCount: cohortMentees.length,
        competentMentees: cohortMentees.filter(
          (mentee) => mentee.competencyStatus === 'Competent',
        ).length,
        inProgressMentees: cohortMentees.filter(
          (mentee) => mentee.competencyStatus === 'In Progress',
        ).length,
        menteesNeedingSupport: cohortMentees.filter(
          (mentee) => mentee.competencyStatus === 'Needs Support',
        ).length,
        learningPlans: cohortPlans,
        learningPlanModules: cohortModules,
        sessions: cohortSessions,
        assessments: assessments.filter(
          (assessment) => assessment.cohortId === cohort.id,
        ),
        submissions: submissions.filter(
          (submission) => submission.cohortId === cohort.id,
        ),
      }
    })
  }

  getById(id: string): ProgramLeadCohortRecord | null {
    return this.getAll().find((cohort) => cohort.id === id) ?? null
  }

  getSummary(
    cohorts: ProgramLeadCohortRecord[] = this.getAll(),
  ): ProgramLeadCohortSummary {
    return {
      total: cohorts.length,
      active: cohorts.filter((cohort) => cohort.status === 'Active').length,
      completed: cohorts.filter(
        (cohort) => cohort.status === 'Completed',
      ).length,
      paused: cohorts.filter((cohort) => cohort.status === 'Paused').length,
      linkedMentees: cohorts.reduce(
        (total, cohort) => total + cohort.menteeCount,
        0,
      ),
    }
  }

  getByStatus(status: CohortStatus): ProgramLeadCohortRecord[] {
    return this.getAll().filter((cohort) => cohort.status === status)
  }
}

export const programLeadCohortService = new ProgramLeadCohortService()
