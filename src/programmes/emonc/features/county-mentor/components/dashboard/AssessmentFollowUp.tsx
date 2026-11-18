import {
  ArrowRight,
  CheckmarkFilled,
  DocumentTasks,
  Information,
} from '@carbon/icons-react'
import { Button } from '@carbon/react'

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
          <span className="county-panel__eyebrow">SITE ASSESSMENTS</span>
          <h2>Assessment follow-up</h2>
          <p>Oversight of findings and agreed actions.</p>
        </div>
        <span className="county-panel__heading-icon">
          <DocumentTasks size={20} />
        </span>
      </div>

      <div className="county-follow-up__metric">
        <strong>{openFindings}</strong>
        <div>
          <span>Open findings</span>
          <small>Requiring follow-up</small>
        </div>
      </div>

      <div className="county-follow-up__guidance">
        <div>
          <CheckmarkFilled size={17} />
          <span>Track actions assigned within the facility team's authority.</span>
        </div>
        <div>
          <Information size={17} />
          <span>
            Escalate or de-escalate actions beyond the team's limit with a
            recorded reason.
          </span>
        </div>
        <div>
          <CheckmarkFilled size={17} />
          <span>Route completed-action approval to the facility chair.</span>
        </div>
      </div>

      <Button
        kind="primary"
        size="md"
        renderIcon={ArrowRight}
        onClick={() => onNavigate('/county-mentor/site-assessments')}
      >
        Open site assessments
      </Button>
    </section>
  )
}

export default AssessmentFollowUp
