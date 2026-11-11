import { useState } from 'react'
import { Button, Tag } from '@carbon/react'
import { ArrowLeft, Checkmark, Send } from '@carbon/icons-react'

import type { MentorCohortSubmission } from '../../types/mentor.types'

interface CohortSubmissionDetailsProps {
  submission: MentorCohortSubmission
  onBack: () => void
  onSaveDraft: (id: string, notes: string) => void
  onSubmit: (id: string, notes: string) => void
}

function CohortSubmissionDetails({
  submission,
  onBack,
  onSaveDraft,
  onSubmit,
}: CohortSubmissionDetailsProps) {
  const [notes, setNotes] = useState(submission.mentorNotes)

  const isLocked = [
    'Submitted',
    'Under Review',
    'Approved',
  ].includes(submission.status)

  const isReady =
    submission.completionPercentage === 100 &&
    submission.competentMentees === submission.menteesCount &&
    submission.completedModules === submission.totalModules

  function handleSaveDraft() {
    onSaveDraft(submission.id, notes)
  }

  function handleSubmit() {
    if (!isReady) return

    onSubmit(submission.id, notes)
  }

  return (
    <section className="cohort-submission-details">
      <div className="submission-details-header">
        <Button
          kind="ghost"
          size="sm"
          renderIcon={ArrowLeft}
          onClick={onBack}
        >
          Back to submissions
        </Button>

        <Tag type={submission.status === 'Approved' ? 'green' : 'blue'}>
          {submission.status}
        </Tag>
      </div>

      <div className="submission-details-title">
        <div>
          <p className="submission-eyebrow">COHORT SUBMISSION</p>
          <h2>{submission.cohortName}</h2>
          <p>{submission.facility}</p>
        </div>
      </div>

      <div className="submission-details-grid">
        <article>
          <span>Total mentees</span>
          <strong>{submission.menteesCount}</strong>
        </article>

        <article>
          <span>Competent mentees</span>
          <strong>
            {submission.competentMentees}/{submission.menteesCount}
          </strong>
        </article>

        <article>
          <span>Completed modules</span>
          <strong>
            {submission.completedModules}/{submission.totalModules}
          </strong>
        </article>

        <article>
          <span>Overall completion</span>
          <strong>{submission.completionPercentage}%</strong>
        </article>
      </div>

      <div className="submission-details-section">
        <h3>Submission readiness</h3>

        <div className="submission-readiness-list">
          <div>
            <span>All mentees have achieved competency</span>
            <Tag
              type={
                submission.competentMentees === submission.menteesCount
                  ? 'green'
                  : 'red'
              }
            >
              {submission.competentMentees === submission.menteesCount
                ? 'Complete'
                : 'Incomplete'}
            </Tag>
          </div>

          <div>
            <span>All training modules completed</span>
            <Tag
              type={
                submission.completedModules === submission.totalModules
                  ? 'green'
                  : 'red'
              }
            >
              {submission.completedModules === submission.totalModules
                ? 'Complete'
                : 'Incomplete'}
            </Tag>
          </div>

          <div>
            <span>Overall cohort completion</span>
            <Tag
              type={
                submission.completionPercentage === 100
                  ? 'green'
                  : 'red'
              }
            >
              {submission.completionPercentage === 100
                ? 'Complete'
                : 'Incomplete'}
            </Tag>
          </div>
        </div>
      </div>

      {submission.reviewFeedback && (
        <div className="submission-review-feedback">
          <h3>County Mentor feedback</h3>
          <p>{submission.reviewFeedback}</p>

          {submission.reviewer && (
            <span>Reviewed by {submission.reviewer}</span>
          )}

          {submission.reviewedAt && (
            <span>
              {new Date(submission.reviewedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      )}

      <div className="submission-details-section">
        <h3>Mentor submission notes</h3>

        <p className="submission-section-description">
          Provide a summary of the cohort training, competency outcomes,
          and any relevant information for the County Mentor reviewer.
        </p>

        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Enter your cohort submission notes..."
          rows={6}
          disabled={isLocked}
        />
      </div>

      {!isLocked && (
        <div className="submission-details-actions">
          <Button
            kind="secondary"
            onClick={handleSaveDraft}
          >
            <Checkmark size={16} />
            Save draft
          </Button>

          <Button
            kind="primary"
            renderIcon={Send}
            disabled={!isReady}
            onClick={handleSubmit}
          >
            Submit for review
          </Button>
        </div>
      )}

      {!isReady && !isLocked && (
        <p className="submission-validation-message">
          This cohort cannot be submitted yet. All mentees must achieve
          competency, all modules must be completed, and overall cohort
          completion must reach 100%.
        </p>
      )}

      {isLocked && (
        <p className="submission-locked-message">
          This submission is currently locked while it is being reviewed
          or after approval.
        </p>
      )}
    </section>
  )
}

export default CohortSubmissionDetails