import { Select, SelectItem } from '@carbon/react';
import type { Level, User } from '../../types/issue.types';

interface AssignmentFieldsProps {
  responsiblePersonId: string;
  level: Level | '';
  users: User[];
  onResponsiblePersonChange: (value: string) => void;
}

function AssignmentFields({
  responsiblePersonId,
  level,
  users,
  onResponsiblePersonChange,
}: AssignmentFieldsProps) {
  const atLevel = level === '' ? [] : users.filter((user) => user.level === level && user.role !== 'SYSTEM_ADMIN');

  return (
    <div className="form-row">
      <Select
        id="responsiblePerson"
        labelText="Responsible person"
        value={responsiblePersonId}
        onChange={(event) => onResponsiblePersonChange(event.target.value)}
        helperText={
          level === ''
            ? 'Choose the implementation level first'
            : atLevel.length === 0
              ? `No users at ${level} level`
              : `Only ${level} level staff`
        }
        disabled={level === ''}
        required
      >
        <SelectItem value="" text="Select person" />
        {atLevel.map((user) => (
          <SelectItem key={user.id} value={user.id} text={`${user.fullName} (${user.cadre})`} />
        ))}
      </Select>
    </div>
  );
}

export default AssignmentFields;
