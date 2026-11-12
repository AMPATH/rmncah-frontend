import { Button, Select, SelectItem, TextArea } from '@carbon/react';
import StatusTag from '../../../../components/shared/StatusTag';
import type { FormEvent } from 'react';
import type { Level, User } from '../../../issues/types/issue.types';
import type { EscalationAction } from '../../types/action.types';

interface EscalateFormProps {
  action: EscalationAction | '';
  targetLevel: Level | '';
  targetPersonId: string;
  reason: string;
  users: User[];
  moved: boolean;
  onActionChange: (value: EscalationAction | '') => void;
  onTargetLevelChange: (value: Level | '') => void;
  onTargetPersonChange: (value: string) => void;
  onReasonChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}


function EscalateForm({
  action,
  targetLevel,
  targetPersonId,
  reason,
  users,
  moved,
  onActionChange,
  onTargetLevelChange,
  onTargetPersonChange,
  onReasonChange,
  onSubmit,
}: EscalateFormProps) {
  return (
    <form className="form-card form-stack" onSubmit={onSubmit}>
      <h2 className="form-section-title">Escalate or de-escalate</h2>

      <Select
        id="escalationAction"
        labelText="Action"
        value={action}
        onChange={(event) => onActionChange(event.target.value as EscalationAction | '')}
        required
      >
        <SelectItem value="" text="Select action" />
        <SelectItem value="escalate" text="Escalate" />
        <SelectItem value="de-escalate" text="De-escalate" />
      </Select>

      <Select
        id="targetLevel"
        labelText="Target level"
        value={targetLevel}
        onChange={(event) => onTargetLevelChange(event.target.value as Level | '')}
        required
      >
        <SelectItem value="" text="Select level" />
        <SelectItem value="community" text="Community" />
        <SelectItem value="facility" text="Facility" />
        <SelectItem value="sub-county" text="Sub-county" />
        <SelectItem value="county" text="County" />
      </Select>

      <Select
        id="targetPerson"
        labelText="Target person"
        value={targetPersonId}
        onChange={(event) => onTargetPersonChange(event.target.value)}
        helperText={users.length === 0 ? 'No users yet' : undefined}
        required
      >
        <SelectItem value="" text="Select person" />
        {users.map((user) => (
          <SelectItem key={user.id} value={user.id} text={`${user.fullName} (${user.cadre})`} />
        ))}
      </Select>

      <TextArea
        id="escalationReason"
        labelText="Reason"
        rows={3}
        value={reason}
        onChange={(event) => onReasonChange(event.target.value)}
        required
      />

      <div className="form-actions">
        <Button type="submit">Move</Button>
        {moved && <StatusTag status="Pending acceptance" />}
      </div>
    </form>
  );
}

export default EscalateForm;
