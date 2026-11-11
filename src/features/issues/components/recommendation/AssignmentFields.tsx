import { Select, SelectItem } from '@carbon/react';
import type { User } from '../../types/issue.types';

interface AssignmentFieldsProps {
  gap: string;
  responsiblePersonId: string;
  gapOptions: string[];
  users: User[];
  onGapChange: (value: string) => void;
  onResponsiblePersonChange: (value: string) => void;
}

// Gap identified and Responsible person.
function AssignmentFields({
  gap,
  responsiblePersonId,
  gapOptions,
  users,
  onGapChange,
  onResponsiblePersonChange,
}: AssignmentFieldsProps) {
  return (
    <div className="form-row">
      <Select
        id="gap"
        labelText="Gap identified"
        value={gap}
        onChange={(event) => onGapChange(event.target.value)}
        helperText={gapOptions.length === 0 ? 'No contributing factors yet' : undefined}
        required
      >
        <SelectItem value="" text="Select gap" />
        {gapOptions.map((option) => (
          <SelectItem key={option} value={option} text={option} />
        ))}
      </Select>

      <Select
        id="responsiblePerson"
        labelText="Responsible person"
        value={responsiblePersonId}
        onChange={(event) => onResponsiblePersonChange(event.target.value)}
        helperText={users.length === 0 ? 'No users yet' : undefined}
        required
      >
        <SelectItem value="" text="Select person" />
        {users.map((user) => (
          <SelectItem key={user.id} value={user.id} text={`${user.fullName} (${user.cadre})`} />
        ))}
      </Select>
    </div>
  );
}

export default AssignmentFields;
