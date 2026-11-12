import { Button, Select, SelectItem, TextArea } from '@carbon/react';
import type { FormEvent } from 'react';
import type { Decision } from '../../types/action.types';

interface ChairDecisionFormProps {
  decision: Decision | '';
  rejectionReason: string;
  onDecisionChange: (value: Decision | '') => void;
  onRejectionReasonChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}


function ChairDecisionForm({
  decision,
  rejectionReason,
  onDecisionChange,
  onRejectionReasonChange,
  onSubmit,
}: ChairDecisionFormProps) {
  return (
    <form className="form-card form-stack" onSubmit={onSubmit}>
      <h2 className="form-section-title">Facility MPDSR chair</h2>

      <Select
        id="decision"
        labelText="Decision"
        value={decision}
        onChange={(event) => onDecisionChange(event.target.value as Decision | '')}
        required
      >
        <SelectItem value="" text="Select decision" />
        <SelectItem value="approve" text="Approve" />
        <SelectItem value="reject" text="Reject" />
      </Select>

      {decision === 'reject' && (
        <TextArea
          id="rejectionReason"
          labelText="Rejection reason"
          rows={3}
          value={rejectionReason}
          onChange={(event) => onRejectionReasonChange(event.target.value)}
          required
        />
      )}

      <div>
        <Button type="submit">Submit decision</Button>
      </div>

      <p className="form-note">
        Approve: Closed. Reject: In progress and reopened to the person who marked it done.
      </p>
    </form>
  );
}

export default ChairDecisionForm;
