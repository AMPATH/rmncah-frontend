import { DatePicker, DatePickerInput, TextInput } from '@carbon/react';
import AutoLabel from '../../../../components/shared/AutoLabel';
import { toIsoDate } from '../../../../utils/dates';
import type { Level } from '../../types/issue.types';

interface CompletionFieldsProps {
  dateOfCompletion: string;
  earliestDate: string;
  latestDate: string;
  showErrors: boolean;
  // The chosen level decides the starting status: sub-county and county need acceptance first.
  level: Level | '';
  onDateOfCompletionChange: (value: string) => void;
}

// Date of completion (limited by the classification) and Status (auto).
function CompletionFields({
  dateOfCompletion,
  earliestDate,
  latestDate,
  showErrors,
  level,
  onDateOfCompletionChange,
}: CompletionFieldsProps) {
  const startingStatus = level === 'sub-county' || level === 'county' ? 'Pending acceptance' : 'Open';

  return (
    <div className="form-row">
      <DatePicker
        datePickerType="single"
        dateFormat="Y-m-d"
        minDate={earliestDate}
        maxDate={latestDate || undefined}
        value={dateOfCompletion}
        onChange={(dates) => onDateOfCompletionChange(toIsoDate(dates[0]))}
      >
        <DatePickerInput
          id="dateOfCompletion"
          labelText="Date of completion"
          placeholder="yyyy-mm-dd"
          pattern="\d{4}-\d{2}-\d{2}"
          disabled={latestDate === ''}
          invalid={showErrors && dateOfCompletion === ''}
          invalidText="Choose a classification first"
        />
      </DatePicker>

      <TextInput id="status" labelText={<AutoLabel text="Status" />} value={startingStatus} readOnly />
    </div>
  );
}

export default CompletionFields;
