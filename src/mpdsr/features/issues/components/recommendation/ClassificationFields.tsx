import { Select, SelectItem, TextInput } from '@carbon/react';
import AutoLabel from '../../../../components/shared/AutoLabel';
import type { Classification, Level } from '../../types/issue.types';

interface ClassificationFieldsProps {
  classification: Classification | '';
  level: Level | '';
  dateLogged: string;
  onClassificationChange: (value: Classification | '') => void;
  onLevelChange: (value: Level | '') => void;
}

// Classification, Level of implementation, Date logged (auto).
function ClassificationFields({
  classification,
  level,
  dateLogged,
  onClassificationChange,
  onLevelChange,
}: ClassificationFieldsProps) {
  return (
    <div className="form-row">
      <Select
        id="classification"
        labelText="Classification"
        value={classification}
        onChange={(event) => onClassificationChange(event.target.value as Classification | '')}
        required
      >
        <SelectItem value="" text="Select classification" />
        <SelectItem value="immediate" text="Immediate (1 month)" />
        <SelectItem value="intermediate" text="Intermediate (3 months)" />
        <SelectItem value="long-term" text="Long term (6 months)" />
      </Select>

      <Select
        id="level"
        labelText="Level of implementation"
        value={level}
        onChange={(event) => onLevelChange(event.target.value as Level | '')}
        required
      >
        <SelectItem value="" text="Select level" />
        <SelectItem value="community" text="Community" />
        <SelectItem value="facility" text="Facility" />
        <SelectItem value="sub-county" text="Sub-county" />
        <SelectItem value="county" text="County" />
      </Select>

      <TextInput id="dateLogged" labelText={<AutoLabel text="Date logged" />} value={dateLogged} readOnly />
    </div>
  );
}

export default ClassificationFields;
