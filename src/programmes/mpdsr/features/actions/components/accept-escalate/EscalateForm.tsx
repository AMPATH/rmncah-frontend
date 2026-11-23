import { Button, Select, SelectItem, TextArea } from '@carbon/react';
import type { FormEvent } from 'react';
import type { Level, User } from '../../../issues/types/issue.types';
import type { EscalationAction } from '../../types/action.types';
import { levelLabels, moveTargets } from '../../../recommendations/utils/levels';

interface EscalateFormProps {
  currentLevel: Level | '';
  issueType?: string;
  action: EscalationAction | '';
  targetLevel: Level | '';
  targetPersonId: string;
  reason: string;
  users: User[];
  blockedBecause: string;
  busy: boolean;
  onActionChange: (value: EscalationAction | '') => void;
  onTargetLevelChange: (value: Level | '') => void;
  onTargetPersonChange: (value: string) => void;
  onReasonChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

function EscalateForm({
  currentLevel,
  issueType,
  action,
  targetLevel,
  targetPersonId,
  reason,
  users,
  blockedBecause,
  busy,
  onActionChange,
  onTargetLevelChange,
  onTargetPersonChange,
  onReasonChange,
  onSubmit,
}: EscalateFormProps) {
  const disabled = blockedBecause !== '';
  const canEscalate = moveTargets(currentLevel, 'escalate', issueType).length > 0;
  const canDeEscalate = moveTargets(currentLevel, 'de-escalate', issueType).length > 0;
  const targets = moveTargets(currentLevel, action, issueType);

  return (
    <form className="form-card form-stack" onSubmit={onSubmit}>
      <h2 className="form-section-title">Escalate or de-escalate</h2>

      <Select
        id="escalationAction"
        labelText="Action"
        value={action}
        disabled={disabled}
        onChange={(event) => onActionChange(event.target.value as EscalationAction | '')}
        required
      >
        <SelectItem value="" text="Select action" />
        <SelectItem value="escalate" text="Escalate (move up)" disabled={!canEscalate} />
        <SelectItem value="de-escalate" text="De-escalate (move down)" disabled={!canDeEscalate} />
      </Select>

      <Select
        id="targetLevel"
        labelText="Target level"
        value={targetLevel}
        disabled={disabled || action === ''}
        onChange={(event) => onTargetLevelChange(event.target.value as Level | '')}
        helperText={
          action === ''
            ? 'Choose escalate or de-escalate first'
            : `Now at ${currentLevel ? levelLabels[currentLevel] : 'no level'}. ${action === 'escalate' ? 'Only higher' : 'Only lower'} levels are shown.`
        }
        required
      >
        <SelectItem value="" text="Select level" />
        {targets.map((level) => (
          <SelectItem key={level} value={level} text={levelLabels[level]} />
        ))}
      </Select>

      <Select
        id="targetPerson"
        labelText="Target person"
        value={targetPersonId}
        disabled={disabled || targetLevel === ''}
        onChange={(event) => onTargetPersonChange(event.target.value)}
        helperText={
          targetLevel === '' ? 'Choose a level first' : users.length === 0 ? 'No users at this level' : undefined
        }
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
        disabled={disabled}
        onChange={(event) => onReasonChange(event.target.value)}
        required
      />

      <div className="form-actions">
        <Button type="submit" disabled={disabled || busy}>
          {busy ? 'Saving…' : 'Move'}
        </Button>
      </div>
      {blockedBecause && <p className="field-hint">{blockedBecause}</p>}
    </form>
  );
}

export default EscalateForm;