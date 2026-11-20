import {
  assessmentRepository,
  cohortRepository,
  facilityRepository,
  menteeRepository,
  mentorRepository,
} from '../../../data/repositories'

import type {
  Assessment,
  Mentee,
  MenteeCompetencyStatus,
} from '../../../data/models'

export interface ProgramLeadMenteeRecord extends Mentee {
  facility: string
  county: string
  cohort: string
  mentor: string
  assessments: Assessment[]
  assessmentCount: number
  completedAssessments: number
  followUpsRequired: number
}

export interface ProgramLeadMenteeSummary {
  total: number
  competent: number
  inProgress: number
  needsSupport: number
}

class ProgramLeadMenteeService {
  getAll(): ProgramLeadMenteeRecord[] {
    const mentees = menteeRepository.getAll()
    const cohorts = cohortRepository.getAll()
    const mentors = mentorRepository.getAll()
    const facilities = facilityRepository.getAll()
    const assessments = assessmentRepository.getAll()

    const cohortById = new Map(
      cohorts.map((cohort) => [cohort.id, cohort]),
    )

    const mentorById = new Map(
      mentors.map((mentor) => [mentor.id, mentor]),
    )

    const facilityById = new Map(
      facilities.map((facility) => [facility.id, facility]),
    )

    return mentees.map((mentee) => {
      const cohort = cohortById.get(mentee.cohortId)
      const mentor = cohort?.mentorId
        ? mentorById.get(cohort.mentorId)
        : undefined

      const menteeAssessments = assessments
        .filter((assessment) => assessment.menteeId === mentee.id)
        .sort((first, second) =>
          second.scheduledDate.localeCompare(first.scheduledDate),
        )

      return {
        ...mentee,
        facility:
          facilityById.get(mentee.facilityId)?.name ??
          'Unknown facility',
        county:
          facilityById.get(mentee.facilityId)?.county ??
          '—',
        cohort: cohort?.name ?? 'Unknown cohort',
        mentor: mentor?.name ?? 'Not assigned',
        assessments: menteeAssessments,
        assessmentCount: menteeAssessments.length,
        completedAssessments: menteeAssessments.filter(
          (assessment) => assessment.status === 'Completed',
        ).length,
        followUpsRequired: menteeAssessments.filter(
          (assessment) => assessment.followUpRequired,
        ).length,
      }
    })
  }

  getById(id: string): ProgramLeadMenteeRecord | null {
    return this.getAll().find((mentee) => mentee.id === id) ?? null
  }

  getSummary(
    mentees: ProgramLeadMenteeRecord[] = this.getAll(),
  ): ProgramLeadMenteeSummary {
    return {
      total: mentees.length,
      competent: mentees.filter(
        (mentee) => mentee.competencyStatus === 'Competent',
      ).length,
      inProgress: mentees.filter(
        (mentee) => mentee.competencyStatus === 'In Progress',
      ).length,
      needsSupport: mentees.filter(
        (mentee) => mentee.competencyStatus === 'Needs Support',
      ).length,
    }
  }

  getByCompetencyStatus(
    status: MenteeCompetencyStatus,
  ): ProgramLeadMenteeRecord[] {
    return this.getAll().filter(
      (mentee) => mentee.competencyStatus === status,
    )
  }
}

export const programLeadMenteeService =
  new ProgramLeadMenteeService()
