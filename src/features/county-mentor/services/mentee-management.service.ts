import {
  assessmentRepository,
  cohortRepository,
  facilityRepository,
  menteeRepository,
  mentorRepository,
} from '../../../core/data/repositories'

import type {
  MenteeDirectoryRecord,
  MenteeSummaryData,
} from '../types/mentee-management.types'

export const menteeManagementService = {
  getAll(): MenteeDirectoryRecord[] {
    const mentees = menteeRepository.getAll()
    const facilities = facilityRepository.getAll()
    const cohorts = cohortRepository.getAll()
    const mentors = mentorRepository.getAll()
    const assessments = assessmentRepository.getAll()

    return mentees.map((mentee) => {
      const facility = facilities.find(
        (item) => item.id === mentee.facilityId,
      )

      const cohort = cohorts.find(
        (item) => item.id === mentee.cohortId,
      )

      const mentor = cohort?.mentorId
        ? mentors.find(
            (item) => item.id === cohort.mentorId,
          )
        : undefined

      const menteeAssessments = assessments
        .filter(
          (assessment) =>
            assessment.menteeId === mentee.id,
        )
        .sort((a, b) =>
          b.scheduledDate.localeCompare(a.scheduledDate),
        )

      return {
        ...mentee,

        facilityName:
          facility?.name ?? 'Facility not assigned',

        cohortName:
          cohort?.name ?? 'Cohort not assigned',

        mentorName:
          mentor?.name ?? null,

        assessments: menteeAssessments,

        completedAssessments:
          menteeAssessments.filter(
            (assessment) =>
              assessment.status === 'Completed',
          ).length,

        followUpRequiredCount:
          menteeAssessments.filter(
            (assessment) =>
              assessment.followUpRequired,
          ).length,

        latestAssessmentDate:
          menteeAssessments[0]?.scheduledDate ?? null,
      }
    })
  },

  getSummary(
    mentees: MenteeDirectoryRecord[],
  ): MenteeSummaryData {
    return {
      totalMentees: mentees.length,

      competent: mentees.filter(
        (mentee) =>
          mentee.competencyStatus === 'Competent',
      ).length,

      inProgress: mentees.filter(
        (mentee) =>
          mentee.competencyStatus === 'In Progress',
      ).length,

      needsSupport: mentees.filter(
        (mentee) =>
          mentee.competencyStatus === 'Needs Support',
      ).length,
    }
  },
}