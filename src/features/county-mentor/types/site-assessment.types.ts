import type {
  Facility,
  SiteAssessment,
  SiteAssessmentFinding,
} from '../../../core/data/models'

export interface SiteAssessmentRecord extends SiteAssessment {
  facility: Facility | null
  findings: SiteAssessmentFinding[]
  openFindings: number
  resolvedFindings: number
}

export interface SiteAssessmentSummary {
  totalAssessments: number
  facilitiesAssessed: number
  pendingAssessments: number
  completedAssessments: number
  openFollowUps: number
}

export interface SiteAssessmentFilters {
  search: string
  status: string
  facilityId: string
}

export interface SiteAssessmentFormData {
  facilityId: string
  assessmentDate: string
  assessorName: string
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled'
  summary: string
  nextFollowUpDate: string
}

export interface SiteAssessmentFindingFormData {
  title: string
  description: string
  assignedTo: string
  dueDate: string
  status: 'Open' | 'In Progress' | 'Resolved' | 'Deferred'
  resolutionNotes: string
}