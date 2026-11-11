import {
  cohortRepository,
  facilityRepository,
  menteeRepository,
  mentorRepository,
} from '../../../core/data/repositories'

import type {
  FacilityDirectoryRecord,
  FacilitySummaryData,
} from '../types/facility-management.types'

export const facilityManagementService = {
  getAll(): FacilityDirectoryRecord[] {
    const facilities = facilityRepository.getAll()
    const mentors = mentorRepository.getAll()
    const cohorts = cohortRepository.getAll()
    const mentees = menteeRepository.getAll()

    return facilities.map((facility) => {
      const facilityMentors = mentors.filter(
        (mentor) => mentor.facilityId === facility.id,
      )

      const facilityCohorts = cohorts.filter(
        (cohort) => cohort.facilityId === facility.id,
      )

      const facilityMentees = mentees.filter(
        (mentee) => mentee.facilityId === facility.id,
      )

      const activeMentors = facilityMentors.filter(
        (mentor) => mentor.status === 'Active',
      ).length

      const activeCohorts = facilityCohorts.filter(
        (cohort) => cohort.status === 'Active',
      ).length

      const activeMentees = facilityMentees.filter(
        (mentee) => mentee.status === 'Active',
      ).length

      return {
        ...facility,

        mentors: facilityMentors,
        cohorts: facilityCohorts,
        mentees: facilityMentees,

        activeMentors,
        activeCohorts,
        activeMentees,

        coverageStatus:
          activeCohorts > 0
            ? 'Covered'
            : 'No active cohort',
      }
    })
  },

  getSummary(
    facilities: FacilityDirectoryRecord[],
  ): FacilitySummaryData {
    return {
      totalFacilities: facilities.length,

      activeFacilities: facilities.filter(
        (facility) => facility.status === 'Active',
      ).length,

      inactiveFacilities: facilities.filter(
        (facility) => facility.status === 'Inactive',
      ).length,

      facilitiesWithMentors: facilities.filter(
        (facility) => facility.activeMentors > 0,
      ).length,

      facilitiesWithoutActiveCohorts: facilities.filter(
        (facility) => facility.activeCohorts === 0,
      ).length,
    }
  },
}