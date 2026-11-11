import type {
  Cohort,
  CohortStatus,
} from '../../../core/data/models'

export interface CohortDirectoryRecord extends Cohort {
  facilityName: string
  mentorName: string | null
  menteesCount: number
  completedCount: number
  inProgressCount: number
  needsSupportCount: number
  progress: number
  trainingModules: string[]
  nextSession: string | null
}

export interface CohortSummaryData {
  totalCohorts: number
  activeCohorts: number
  completedCohorts: number
  pausedCohorts: number
  totalMentees: number
}

export type CohortStatusFilter = 'All' | CohortStatus