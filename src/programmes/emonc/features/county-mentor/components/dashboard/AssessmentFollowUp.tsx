import { Button } from '@carbon/react'
import { ArrowRight, CheckmarkFilled } from '@carbon/icons-react'

interface AssessmentFollowUpProps {
  openFindings: number
  onNavigate: (path: string) => void
}

function AssessmentFollowUp({
  openFindings,
  onNavigate,
}: AssessmentFollowUpProps) {
  return (
    <section className="county-panel county-follow-up">
      <div className="county-panel__heading">
        <div>
          <h2>Assessment follow-up</h2>
          <p>Oversight of findings and agreed actions.</p>
        </div>
      </div>

      <div className="county-follow-up__metric">
        <strong>{openFindings}</strong>
        <span>Open findings and actions</span>
      </div>

      <ul className="county-follow-up__list">
        <li>
          <CheckmarkFilled size={16} />
          <span>
            Track actions assigned within the facility team's authority.
          </span>
        </li>

        <li>
          <ArrowRight size={16} />
          <span>
            Escalate or de-escalate actions beyond the team's limit with
            a recorded reason.
          </span>
        </li>

        <li>
          <CheckmarkFilled size={16} />
          <span>
            Route completed-action approval to the facility chair.
          </span>
        </li>
      </ul>

      <Button
        kind="tertiary"
        size="sm"
        renderIcon={ArrowRight}
        onClick={() => onNavigate('/county-mentor/site-assessments')}
      >
        Open site assessments
      </Button>
    </section>
  )
}

export default AssessmentFollowUp