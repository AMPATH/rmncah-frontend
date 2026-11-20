import {
  cohortRepository,
  facilityRepository,
  menteeRepository,
  mentorRepository,
} from '../../../data/repositories'

import type {
  Mentor,
  RecordStatus,
} from '../../../data/models'

export interface ProgramLeadMentorRecord extends Mentor {
  facility: string
  cohortsAssigned: number
  menteesAssigned: number
}

export interface ProgramLeadMentorSummary {
  total: number
  active: number
  inactive: number
  assignedCohorts: number
}

class ProgramLeadMentorService {
  getAll(): ProgramLeadMentorRecord[] {
    const mentors = mentorRepository.getAll()
    const cohorts = cohortRepository.getAll()
    const mentees = menteeRepository.getAll()
    const facilities = facilityRepository.getAll()

    const facilityById = new Map(
      facilities.map((facility) => [facility.id, facility]),
    )

    return mentors.map((mentor) => {
      const assignedCohorts = cohorts.filter(
        (cohort) => cohort.mentorId === mentor.id,
      )

      const assignedCohortIds = new Set(
        assignedCohorts.map((cohort) => cohort.id),
      )

      const menteesAssigned = mentees.filter((mentee) =>
        assignedCohortIds.has(mentee.cohortId),
      ).length

      return {
        ...mentor,
        facility:
          facilityById.get(mentor.facilityId)?.name ??
          'Unknown facility',
        cohortsAssigned: assignedCohorts.length,
        menteesAssigned,
      }
    })
  }

  getById(id: string): ProgramLeadMentorRecord | null {
    return this.getAll().find((mentor) => mentor.id === id) ?? null
  }

  getSummary(
    mentors: ProgramLeadMentorRecord[] = this.getAll(),
  ): ProgramLeadMentorSummary {
    return {
      total: mentors.length,
      active: mentors.filter(
        (mentor) => mentor.status === 'Active',
      ).length,
      inactive: mentors.filter(
        (mentor) => mentor.status === 'Inactive',
      ).length,
      assignedCohorts: mentors.reduce(
        (total, mentor) => total + mentor.cohortsAssigned,
        0,
      ),
    }
  }

  getByStatus(
    status: RecordStatus,
  ): ProgramLeadMentorRecord[] {
    return this.getAll().filter(
      (mentor) => mentor.status === status,
    )
  }
}

export const programLeadMentorService =
  new ProgramLeadMentorService()
