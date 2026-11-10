import { DatePicker, DatePickerInput } from '@carbon/react';
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
          invalid={showErrors && dateOfBirth === ''}
          invalidText="Enter the date of birth"
        />
      </DatePicker>

      <div className="field">
        <label htmlFor="age">Age (auto)</label>
        <input id="age" type="text" value={age} readOnly />
      </div>

      <div className="field">
        <label htmlFor="gender">Gender</label>
        {issueType === 'perinatal' ? (
          <select
            id="gender"
            value={gender}
            onChange={(event) => onGenderChange(event.target.value)}
            required
          >
            <option value="">Select gender</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        ) : (
          <input id="gender" type="text" value={issueType === '' ? '' : 'Female'} readOnly />
        )}
      </div>
    </div>
  );
}

export default PersonFields;
