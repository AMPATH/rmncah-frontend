import { Button, DatePicker, DatePickerInput, Select, SelectItem, TextArea } from '@carbon/react';
import type { FormEvent } from 'react';
import type { User } from '../../../issues/types/issue.types';
import { toIsoDate } from '../../../issues/utils/dates';

interface ReassignFormProps {
  newResponsiblePersonId: string;
  newCompletionDate: string;
  reason: string;
  users: User[];
  today: string;
  showErrors: boolean;
  onPersonChange: (value: string) => void;
  onCompletionDateChange: (value: string) => void;
  onReasonChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}


function ReassignForm({
  newResponsiblePersonId,
  newCompletionDate,
  reason,
  users,
  today,
  showErrors,
  onPersonChange,
  onCompletionDateChange,
  onReasonChange,
  onSubmit,
}: ReassignFormProps) {
  return (
    <form className="form-card form-stack" onSubmit={onSubmit}>
      <h2 className="form-section-title">PCN coordinator reassigns</h2>

      <Select
        id="newResponsiblePerson"
        labelText="New responsible person"
        value={newResponsiblePersonId}
        onChange={(event) => onPersonChange(event.target.value)}
        helperText={users.length === 0 ? 'No users yet' : undefined}
        required
      >
        <SelectItem value="" text="Select person" />
        {users.map((user) => (
          <SelectItem key={user.id} value={user.id} text={`${user.fullName} (${user.cadre})`} />
        ))}
      </Select>

      <DatePicker
        datePickerType="single"
        dateFormat="Y-m-d"
        minDate={today}
        value={newCompletionDate}
        onChange={(dates) => onCompletionDateChange(toIsoDate(dates[0]))}
      >
        <DatePickerInput
          id="newCompletionDate"
          labelText="New completion date"
          placeholder="yyyy-mm-dd"
          pattern="\d{4}-\d{2}-\d{2}"
          invalid={showErrors && newCompletionDate === ''}
          invalidText="Enter the new completion date"
        />
      </DatePicker>

      <TextArea
        id="reassignReason"
        labelText="Reason or instructions"
        rows={3}
        value={reason}
        onChange={(event) => onReasonChange(event.target.value)}
        required
      />

      <div>
        <Button type="submit">Reassign</Button>
      </div>
    </form>
  );
}

export default ReassignForm;
