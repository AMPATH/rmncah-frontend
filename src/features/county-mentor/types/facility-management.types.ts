import type {
  Cohort,
  Facility,
  Mentee,
  Mentor,
} from '../../../core/data/models'

export type FacilityCoverageStatus =
  | 'Covered'
  | 'No active cohort'

export interface FacilityDirectoryRecord extends Facility {
  mentors: Mentor[]
  cohorts: Cohort[]
  mentees: Mentee[]

  activeMentors: number
  activeCohorts: number
  activeMentees: number

  coverageStatus: FacilityCoverageStatus
}

export interface FacilitySummaryData {
  totalFacilities: number
  activeFacilities: number
  inactiveFacilities: number
  facilitiesWithMentors: number
  facilitiesWithoutActiveCohorts: number
}