import { useMemo, useState } from 'react'

import CohortSubmissionSummary from '../components/cohort-submissions/CohortSubmissionSummary'
import CohortSubmissionFilters from '../components/cohort-submissions/CohortSubmissionFilters'
import CohortSubmissionTable from '../components/cohort-submissions/CohortSubmissionTable'
import CohortSubmissionDetails from '../components/cohort-submissions/CohortSubmissionDetails'

import { mentorCohortSubmissionsData } from '../data/mentorCohortSubmissionsData'

import type {
  CohortSubmissionStatus,
  MentorCohortSubmission,
} from '../types/mentor.types'

import '../styles/mentor-cohort-submissions.scss'

interface CohortSubmissionsPageProps {
  title: string
}

function CohortSubmissionsPage({
  title,
}: CohortSubmissionsPageProps) {
  const [submissions, setSubmissions] = useState<MentorCohortSubmission[]>(
    mentorCohortSubmissionsData,
  )

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<
    'All' | CohortSubmissionStatus
  >('All')

  const [selectedSubmissionId, setSelectedSubmissionId] = useState<
    string | null
  >(null)

  const filteredSubmissions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return submissions.filter((submission) => {
      const matchesSearch =
        submission.cohortName.toLowerCase().includes(normalizedSearch) ||
        submission.facility.toLowerCase().includes(normalizedSearch)

      const matchesStatus =
        selectedStatus === 'All' ||
        submission.status === selectedStatus

      return matchesSearch && matchesStatus
    })
  }, [submissions, searchTerm, selectedStatus])

  const selectedSubmission = submissions.find(
    (submission) => submission.id === selectedSubmissionId,
  )

  function updateSubmission(
    id: string,
    updates: Partial<MentorCohortSubmission>,
  ) {
    setSubmissions((currentSubmissions) =>
      currentSubmissions.map((submission) =>
        submission.id === id
          ? { ...submission, ...updates }
          : submission,
      ),
    )
  }

  function handleSaveDraft(id: string, notes: string) {
    updateSubmission(id, {
      mentorNotes: notes,
      status: 'Draft',
    })
  }

  function handleSubmit(id: string, notes: string) {
    const submission = submissions.find((item) => item.id === id)

    if (!submission) return

    const isReady =
      submission.completionPercentage === 100 &&
      submission.competentMentees === submission.menteesCount &&
      submission.completedModules === submission.totalModules

    if (!isReady) return

    updateSubmission(id, {
      mentorNotes: notes,
      status: 'Submitted',
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewer: null,
      reviewFeedback: '',
    })
  }

  function handleBack() {
    setSelectedSubmissionId(null)
  }

  return (
    <div className="mentor-cohort-submissions-page">
      <div className="mentor-cohort-submissions-header">
        <div>
          <p className="mentor-page-eyebrow">MENTOR WORKSPACE</p>
          <h1>{title}</h1>
          <p>
            Prepare completed cohorts and submit them to the County Mentor
            for review.
          </p>
        </div>
      </div>

      {selectedSubmission ? (
        <CohortSubmissionDetails
          key={selectedSubmission.id}
          submission={selectedSubmission}
          onBack={handleBack}
          onSaveDraft={handleSaveDraft}
          onSubmit={handleSubmit}
        />
      ) : (
        <>
          <CohortSubmissionSummary submissions={submissions} />

          <section className="cohort-submission-workspace">
            <div className="cohort-submission-workspace__header">
              <div>
                <h2>Cohort submissions</h2>
                <p>
                  Review cohort completion and track submission progress.
                </p>
              </div>

              <span className="submission-record-count">
                {filteredSubmissions.length} records
              </span>
            </div>

            <CohortSubmissionFilters
              searchTerm={searchTerm}
              selectedStatus={selectedStatus}
              onSearchChange={setSearchTerm}
              onStatusChange={setSelectedStatus}
            />

            <CohortSubmissionTable
              submissions={filteredSubmissions}
              onView={(submission) =>
                setSelectedSubmissionId(submission.id)
              }
            />
          </section>
        </>
      )}

      <p className="submission-demo-notice">
        Demonstration data: submission changes are currently held in local
        page state and are not saved to the backend.
      </p>
    </div>
  )
}

export default CohortSubmissionsPage