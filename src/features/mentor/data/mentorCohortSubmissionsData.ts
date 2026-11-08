import type { MentorCohortSubmission } from '../types/mentor.types'

/**
 * Illustrative frontend records.
 *
 * These values are for UI development and testing only.
 * They will be replaced by records returned from the backend API.
 */

export const mentorCohortSubmissionsData: MentorCohortSubmission[] = [
  {
    id: 'submission-001',
    cohortId: 'cohort-001',
    cohortName: 'Cohort A',
    facility: 'Facility A',
    mentorName: 'Assigned Mentor',
    menteesCount: 10,
    competentMentees: 10,
    completedModules: 3,
    totalModules: 3,
    completionPercentage: 100,
    status: 'Draft',
    mentorNotes:
      'All mentees have completed the assigned training modules and competency assessments.',
    submittedAt: null,
    reviewedAt: null,
    reviewer: null,
    reviewFeedback: '',
  },
  {
    id: 'submission-002',
    cohortId: 'cohort-002',
    cohortName: 'Cohort B',
    facility: 'Facility B',
    mentorName: 'Assigned Mentor',
    menteesCount: 8,
    competentMentees: 8,
    completedModules: 3,
    totalModules: 3,
    completionPercentage: 100,
    status: 'Submitted',
    mentorNotes:
      'The cohort has completed the required learning activities and competency assessments. Submitted for review.',
    submittedAt: '2026-11-05T09:30:00.000Z',
    reviewedAt: null,
    reviewer: null,
    reviewFeedback: '',
  },
  {
    id: 'submission-003',
    cohortId: 'cohort-003',
    cohortName: 'Cohort C',
    facility: 'Facility C',
    mentorName: 'Assigned Mentor',
    menteesCount: 7,
    competentMentees: 7,
    completedModules: 3,
    totalModules: 3,
    completionPercentage: 100,
    status: 'Returned',
    mentorNotes:
      'All required training and competency assessments have been completed.',
    submittedAt: '2026-11-02T11:00:00.000Z',
    reviewedAt: '2026-11-04T14:15:00.000Z',
    reviewer: 'County Mentor',
    reviewFeedback:
      'Please provide additional clarification in the mentor submission notes before resubmitting.',
  },
  {
    id: 'submission-004',
    cohortId: 'cohort-004',
    cohortName: 'Cohort D',
    facility: 'Facility D',
    mentorName: 'Assigned Mentor',
    menteesCount: 7,
    competentMentees: 3,
    completedModules: 1,
    totalModules: 3,
    completionPercentage: 43,
    status: 'Not Ready',
    mentorNotes: '',
    submittedAt: null,
    reviewedAt: null,
    reviewer: null,
    reviewFeedback: '',
  },
]