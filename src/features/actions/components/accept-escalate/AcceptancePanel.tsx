import { Button } from '@carbon/react';
import StatusTag from '../../../../components/shared/StatusTag';
import InfoList from '../../../../components/shared/InfoList';

interface AcceptancePanelProps {
  accepted: boolean;
  onAccept: () => void;
}

// Who assigned the recommendation, the acceptance rules, and the Accept button.
function AcceptancePanel({ accepted, onAccept }: AcceptancePanelProps) {
  return (
    <section className="form-card">
      <h2 className="form-section-title">Assignment and acceptance</h2>

      <InfoList
        items={[
          { label: 'Assigned to / by (auto)', value: '—' },
          { label: 'Acceptance needed (auto)', value: 'Yes, for sub-county or county' },
          { label: 'Deadline (escalation matrix)', value: '3 days' },
          { label: 'Reminders sent', value: 'Daily until accepted' },
        ]}
      />

      {accepted ? (
        <StatusTag status="In progress" />
      ) : (
        <Button onClick={onAccept}>Accept</Button>
      )}
    </section>
  );
}

export default AcceptancePanel;
