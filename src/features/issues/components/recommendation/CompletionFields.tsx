import { DatePicker, DatePickerInput, TextInput } from '@carbon/react';
import AutoLabel from '../../../../components/shared/AutoLabel';
import { toIsoDate } from '../../utils/dates';

interface CompletionFieldsProps {
  dateOfCompletion: string;
  earliestDate: string;
  latestDate: string;
  showErrors: boolean;
  onDateOfCompletionChange: (value: string) => void;
}

// Date of completion (limited by the classification) and Status (auto).
function CompletionFields({
  dateOfCompletion,
  earliestDate,
  latestDate,
  showErrors,
  onDateOfCompletionChange,
}: CompletionFieldsProps) {
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

      <TextInput id="status" labelText={<AutoLabel text="Status" />} value="Open" readOnly />
    </div>
  );
}

export default CompletionFields;
