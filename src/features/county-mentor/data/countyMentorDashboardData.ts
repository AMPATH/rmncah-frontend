import type { CountyMentorDashboardData } from '../types/county-mentor.types'

export const countyMentorDashboardData: CountyMentorDashboardData = {
  statistics: [
    {
      id: 'active-mentors',
      label: 'Active mentors',
      value: 48,
      description: 'Across the county programme',
    },
    {
      id: 'registered-mentees',
      label: 'Registered mentees',
      value: 126,
      description: 'Under mentorship',
    },
    {
      id: 'participating-facilities',
      label: 'Participating facilities',
      value: 32,
      description: 'Across the county',
    },
    {
      id: 'active-cohorts',
      label: 'Active cohorts',
      value: 12,
      description: 'Currently in progress',
    },
  ],

  attentionItems: [
    {
      id: 'cohort-submissions',
      title: 'Cohort submissions',
      count: 4,
      description: 'Completed cohorts awaiting your review.',
      action: 'Review submissions',
      path: '/county-mentor/cohorts',
      tone: 'warning',
    },
    {
      id: 'site-assessments',
      title: 'Site assessment findings',
      count: 7,
      description: 'Open findings requiring follow-up.',
      action: 'View assessments',
      path: '/county-mentor/site-assessments',
      tone: 'danger',
    },
    {
      id: 'feedback-challenges',
      title: 'Feedback and challenges',
      count: 5,
      description: 'Items awaiting review or follow-up.',
      action: 'View feedback',
      path: '/county-mentor/feedback',
      tone: 'info',
    },
    {
      id: 'certification-reviews',
      title: 'Certification reviews',
      count: 9,
      description: 'Mentor certification records pending review.',
      action: 'Review certification',
      path: '/county-mentor/certification',
      tone: 'success',
    },
  ],

  performance: [
    {
      id: 'mentee-progress',
      label: 'Mentee milestone progress',
      value: 76,
      detail:
        '96 of 126 mentees have reached their current milestones.',
    },
    {
      id: 'facility-participation',
      label: 'Facility participation',
      value: 84,
      detail: '27 of 32 facilities have recorded recent activity.',
    },
    {
      id: 'assessment-coverage',
      label: 'Site assessment coverage',
      value: 62,
      detail: '20 of 32 facilities have completed an assessment.',
    },
  ],

  openFindings: 7,

  cohortSubmissions: [
    {
      id: 'submission-001',
      cohort: 'Eldoret Central Cohort',
      facility: 'Moi Teaching and Referral Hospital',
      mentor: 'Senior Mentor A',
      submitted: '06 Nov 2026',
      status: 'Submitted for review',
      tone: 'pending',
    },
    {
      id: 'submission-002',
      cohort: 'Iten Mentorship Cohort',
      facility: 'Iten County Referral Hospital',
      mentor: 'Senior Mentor B',
      submitted: '05 Nov 2026',
      status: 'Under review',
      tone: 'review',
    },
    {
      id: 'submission-003',
      cohort: 'Turbo Cohort 03',
      facility: 'Turbo Sub-County Hospital',
      mentor: 'Senior Mentor C',
      submitted: '03 Nov 2026',
      status: 'Submitted for review',
      tone: 'pending',
    },
  ],

  facilities: [
    {
      id: 'facility-001',
      name: 'Moi Teaching and Referral Hospital',
      location: 'Eldoret',
      mentors: 8,
      mentees: 24,
      activity: 'Active',
    },
    {
      id: 'facility-002',
      name: 'Iten County Referral Hospital',
      location: 'Iten',
      mentors: 5,
      mentees: 16,
      activity: 'Active',
    },
    {
      id: 'facility-003',
      name: 'Turbo Sub-County Hospital',
      location: 'Turbo',
      mentors: 3,
      mentees: 12,
      activity: 'Needs follow-up',
    },
    {
      id: 'facility-004',
      name: 'Burnt Forest Sub-County Hospital',
      location: 'Burnt Forest',
      mentors: 4,
      mentees: 14,
      activity: 'Active',
    },
    {
      id: 'facility-005',
      name: 'Kapsabet County Referral Hospital',
      location: 'Kapsabet',
      mentors: 6,
      mentees: 18,
      activity: 'Active',
    },
  ],

  recentActivities: [
    {
      id: 'activity-001',
      title: 'Cohort submitted for review',
      detail: 'Eldoret Central Cohort',
      time: '06 Nov 2026',
      type: 'submission',
    },
    {
      id: 'activity-002',
      title: 'Site assessment recorded',
      detail: 'Iten County Referral Hospital',
      time: '05 Nov 2026',
      type: 'assessment',
    },
    {
      id: 'activity-003',
      title: 'Mentorship activity updated',
      detail: 'Turbo Sub-County Hospital',
      time: '04 Nov 2026',
      type: 'mentorship',
    },
  ],

  upcomingActivities: [
    {
      id: 'upcoming-001',
      title: 'County mentorship review meeting',
      date: '10 Nov 2026',
      location: 'County coordination office',
    },
    {
      id: 'upcoming-002',
      title: 'Facility follow-up visit',
      date: '12 Nov 2026',
      location: 'Turbo Sub-County Hospital',
    },
    {
      id: 'upcoming-003',
      title: 'Cohort submission review',
      date: '14 Nov 2026',
      location: 'County coordination office',
    },
  ],
}