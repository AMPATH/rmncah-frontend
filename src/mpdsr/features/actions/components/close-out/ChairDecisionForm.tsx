import { Button, Select, SelectItem, TextArea } from '@carbon/react';
import type { FormEvent } from 'react';
import type { Decision } from '../../types/action.types';

interface ChairDecisionFormProps {
  decision: Decision | '';
  rejectionReason: string;
  blockedBecause: string;
  busy: boolean;
  onDecisionChange: (value: Decision | '') => void;
  onRejectionReasonChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

// The facility MPDSR chair approves the work, or rejects it with a reason.
function ChairDecisionForm({
  decision,
  rejectionReason,
  blockedBecause,
  busy,
  onDecisionChange,
  onRejectionReasonChange,
  onSubmit,
}: ChairDecisionFormProps) {
  const disabled = blockedBecause !== '';

  return (
    <form className="form-card form-stack" onSubmit={onSubmit}>
      <h2 className="form-section-title">Facility MPDSR chair</h2>

      <Select
        id="decision"
        labelText="Decision"
        value={decision}
        disabled={disabled}
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
          disabled={disabled}
          onChange={(event) => onRejectionReasonChange(event.target.value)}
          required
        />
      )}

      <div>
        <Button type="submit" disabled={disabled || busy}>
          {busy ? 'Saving…' : 'Submit decision'}
        </Button>
      </div>
      {blockedBecause && <p className="field-hint">{blockedBecause}</p>}

      <p className="form-note">
        Approve: Closed. Reject: In progress and reopened to the person who marked it done.
      </p>
    </form>
  );
}

export default ChairDecisionForm;
