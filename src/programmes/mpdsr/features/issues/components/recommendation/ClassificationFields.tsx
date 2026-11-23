import { Select, SelectItem, TextInput } from '@carbon/react';
import AutoLabel from '../../../../components/shared/AutoLabel';
import type { Classification, Level } from '../../types/issue.types';
import { levelLabels, levelsFor } from '../../../recommendations/utils/levels';

interface ClassificationFieldsProps {
  classification: Classification | '';
  level: Level | '';
  dateLogged: string;
  onClassificationChange: (value: Classification | '') => void;
  onLevelChange: (value: Level | '') => void;
  showLevel?: boolean;
  issueType?: string;
}

function ClassificationFields({
  classification,
  level,
  dateLogged,
  onClassificationChange,
  onLevelChange,
  showLevel = true,
  issueType,
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

      {showLevel && (
      <Select
        id="level"
        labelText="Level of implementation"
        value={level}
        onChange={(event) => onLevelChange(event.target.value as Level | '')}
        required
      >
        <SelectItem value="" text="Select level" />
        {levelsFor(issueType).map((key) => (
          <SelectItem key={key} value={key} text={levelLabels[key]} />
        ))}
      </Select>
      )}

      <TextInput id="dateLogged" labelText={<AutoLabel text="Date logged" />} value={dateLogged} readOnly />
    </div>
  );
}

export default ClassificationFields;