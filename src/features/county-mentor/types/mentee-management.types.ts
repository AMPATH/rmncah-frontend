import type {
  Assessment,
  Mentee,
  MenteeCompetencyStatus,
} from '../../../core/data/models'

export interface MenteeDirectoryRecord extends Mentee {
  facilityName: string
  cohortName: string
  mentorName: string | null

  assessments: Assessment[]
  completedAssessments: number
  followUpRequiredCount: number
  latestAssessmentDate: string | null
}

export interface MenteeSummaryData {
  totalMentees: number
  competent: number
  inProgress: number
  needsSupport: number
}

export type MenteeCompetencyFilter =
  | 'All'
  | MenteeCompetencyStatus

export type MenteeAccountStatusFilter =
  | 'All'
  | 'Active'
  | 'Inactive'