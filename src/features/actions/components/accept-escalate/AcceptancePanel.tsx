import { Button } from '@carbon/react';
import InfoList from '../../../../components/shared/InfoList';

interface AcceptancePanelProps {
  assignedTo: string;
  blockedBecause: string;
  busy: boolean;
  onAccept: () => void;
}

// Who the recommendation is assigned to, the acceptance rules, and the Accept button.
function AcceptancePanel({ assignedTo, blockedBecause, busy, onAccept }: AcceptancePanelProps) {
  return (
    <section className="form-card form-stack">
      <h2 className="form-section-title">Assignment and acceptance</h2>

      <InfoList
        items={[
          { label: 'Assigned to', value: assignedTo },
          { label: 'Acceptance needed', value: 'Yes, for sub-county or county, or after a move' },
          { label: 'Deadline (escalation matrix)', value: '3 days' },
          { label: 'Reminders sent', value: 'Daily until accepted' },
        ]}
      />

      <div>
        <Button onClick={onAccept} disabled={blockedBecause !== '' || busy}>
          {busy ? 'Saving…' : 'Accept'}
        </Button>
      </div>
      {blockedBecause && <p className="field-hint">{blockedBecause}</p>}
    </section>
  );
}

export default AcceptancePanel;
