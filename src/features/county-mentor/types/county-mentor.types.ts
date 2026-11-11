export interface CountyStatistic {
  id: string
  label: string
  value: number
  description: string
}

export interface CountyAttentionItem {
  id: string
  title: string
  count: number
  description: string
  action: string
  path: string
  tone: 'warning' | 'danger' | 'info' | 'success'
}

export interface ProgrammePerformanceItem {
  id: string
  label: string
  value: number
  detail: string
}

export interface CohortSubmission {
  id: string
  cohort: string
  facility: string
  mentor: string
  submitted: string
  status: 'Submitted for review' | 'Under review'
  tone: 'pending' | 'review'
}

export interface FacilityCoverageItem {
  id: string
  name: string
  location: string
  mentors: number
  mentees: number
  activity: 'Active' | 'Needs follow-up'
}

export interface CountyActivity {
  id: string
  title: string
  detail: string
  time: string
  type: 'submission' | 'assessment' | 'mentorship'
}

export interface UpcomingCountyActivity {
  id: string
  title: string
  date: string
  location: string
}

export interface CountyMentorDashboardData {
  statistics: CountyStatistic[]
  attentionItems: CountyAttentionItem[]
  performance: ProgrammePerformanceItem[]
  openFindings: number
  cohortSubmissions: CohortSubmission[]
  facilities: FacilityCoverageItem[]
  recentActivities: CountyActivity[]
  upcomingActivities: UpcomingCountyActivity[]
}

export type CountyMentorStatus = 'Active' | 'Inactive'

export interface CountyMentorRecord {
  id: string
  name: string
  email: string
  phone: string
  facility: string
  county: string
  professionalRole: string
  specialty: string
  cohortsAssigned: number
  menteesAssigned: number
  status: CountyMentorStatus
  dateAdded: string
}