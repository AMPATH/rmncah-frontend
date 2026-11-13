import { DatePicker, DatePickerInput, Select, SelectItem, TextInput } from '@carbon/react';
import AutoLabel from '../../../../components/shared/AutoLabel';
import type { IssueType } from '../../types/issue.types';
import { toIsoDate } from '../../utils/dates';

interface PersonFieldsProps {
  issueType: IssueType | '';
  dateOfBirth: string;
  age: string;
  gender: string;
  today: string;
  earliestDateOfBirth: string;
  showErrors: boolean;
  onDateOfBirthChange: (value: string) => void;
  onGenderChange: (value: string) => void;
}

// Step 2, second row: Date of birth, Age (auto), Gender.
// A maternal case is always female; only a perinatal case asks for the gender.
function PersonFields({
  issueType,
  dateOfBirth,
  age,
  gender,
  today,
  earliestDateOfBirth,
  showErrors,
  onDateOfBirthChange,
  onGenderChange,
}: PersonFieldsProps) {
  return (
    <div className="form-row">
      <DatePicker
        datePickerType="single"
        dateFormat="Y-m-d"
        minDate={earliestDateOfBirth || undefined}
        maxDate={today}
        value={dateOfBirth}
        onChange={(dates) => onDateOfBirthChange(toIsoDate(dates[0]))}
      >
        <DatePickerInput
          id="dateOfBirth"
          labelText="Date of birth"
          placeholder="yyyy-mm-dd"
          pattern="\d{4}-\d{2}-\d{2}"
          invalid={showErrors && dateOfBirth === ''}
          invalidText="Enter the date of birth"
        />
      </DatePicker>

      <TextInput id="age" labelText={<AutoLabel text="Age" />} value={age} readOnly />

      {issueType === 'perinatal' ? (
        <Select
          id="gender"
          labelText="Gender"
          value={gender}
          onChange={(event) => onGenderChange(event.target.value)}
          required
        >
          <SelectItem value="" text="Select gender" />
          <SelectItem value="female" text="Female" />
          <SelectItem value="male" text="Male" />
        </Select>
      ) : (
        <TextInput
          id="gender"
          labelText="Gender"
          value={issueType === '' ? '' : 'Female'}
          readOnly
        />
      )}
    </div>
  );
}

export default PersonFields;
