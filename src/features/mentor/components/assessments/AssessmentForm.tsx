
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button, Checkbox } from '@carbon/react'

import type {
  MentorAssessment,
  MentorAssessmentFormValues,
} from '../../types/mentor.types'

interface AssessmentFormProps {
  assessment: MentorAssessment
  onSave: (values: MentorAssessmentFormValues) => void
  onCancel: () => void
}

export default function AssessmentForm({
  assessment,
  onSave,
  onCancel,
}: AssessmentFormProps) {
  const [status, setStatus] = useState(assessment.status)
  const [outcome, setOutcome] = useState(assessment.outcome)
  const [notes, setNotes] = useState(assessment.notes)
  const [followUpRequired, setFollowUpRequired] = useState(
    assessment.followUpRequired,
  )

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formValues: MentorAssessmentFormValues = {
      status,
      outcome,
      notes,
      followUpRequired,
    }

    onSave(formValues)
  }

  return (
    <form className="assessment-form" onSubmit={handleSubmit}>
      <div className="assessment-form__header">
        <div>
          <span>UPDATE ASSESSMENT</span>
          <h2>{assessment.menteeName}</h2>
          <p>{assessment.moduleTitle}</p>
        </div>
      </div>

      <div className="assessment-form__field">
        <label htmlFor="assessment-form-status">
          Assessment status
        </label>

        <select
          id="assessment-form-status"
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as MentorAssessment['status'])
          }
        >
          <option value="Scheduled">Scheduled</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="assessment-form__field">
        <label htmlFor="assessment-form-outcome">
          Competency outcome
        </label>

        <select
          id="assessment-form-outcome"
          value={outcome}
          onChange={(event) =>
            setOutcome(event.target.value as MentorAssessment['outcome'])
          }
        >
          <option value="Pending">Pending</option>
          <option value="Competent">Competent</option>
          <option value="Needs Support">Needs Support</option>
        </select>

        <small>
          Record the outcome according to the applicable assessment criteria.
        </small>
      </div>

      <div className="assessment-form__field">
        <label htmlFor="assessment-form-notes">
          Assessment notes
        </label>

        <textarea
          id="assessment-form-notes"
          rows={5}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Record observations, feedback and areas requiring improvement..."
        />
      </div>

      <div className="assessment-form__checkbox">
        <Checkbox
          id="assessment-follow-up"
          labelText="Follow-up or additional coaching is required"
          checked={followUpRequired}
          onChange={(_, { checked }) => setFollowUpRequired(checked)}
        />
      </div>

      <div className="assessment-form__footer">
        <Button
          type="button"
          kind="secondary"
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button type="submit">
          Save assessment
        </Button>
      </div>
    </form>
  )
}
