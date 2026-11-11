import { DatePicker, DatePickerInput } from '@carbon/react';
import AutoLabel from '../../../../components/shared/AutoLabel';
import { toIsoDate } from '../../utils/dates';

interface DateFieldsProps {
  isDeath: boolean;
  dateOfBirth: string;
  dateOfDeath: string;
  dateOfNotification: string;
  today: string;
  showErrors: boolean;
  onDateOfDeathChange: (value: string) => void;
  onDateOfNotificationChange: (value: string) => void;
}


function DateFields({
  isDeath,
  dateOfBirth,
  dateOfDeath,
  dateOfNotification,
  today,
  showErrors,
  onDateOfDeathChange,
  onDateOfNotificationChange,
}: DateFieldsProps) {
  return (
    <div className="form-row">
      {isDeath && (
        <DatePicker
          datePickerType="single"
          dateFormat="Y-m-d"
          minDate={dateOfBirth || undefined}
          maxDate={today}
          value={dateOfDeath}
          onChange={(dates) => onDateOfDeathChange(toIsoDate(dates[0]))}
        >
          <DatePickerInput
            id="dateOfDeath"
            labelText="Date of death"
            placeholder="yyyy-mm-dd"
          pattern="\d{4}-\d{2}-\d{2}"
            invalid={showErrors && dateOfDeath === ''}
            invalidText="Enter the date of death"
          />
        </DatePicker>
      )}

      <DatePicker
        datePickerType="single"
        dateFormat="Y-m-d"
        minDate={dateOfDeath || undefined}
        maxDate={today}
        value={dateOfNotification}
        onChange={(dates) => onDateOfNotificationChange(toIsoDate(dates[0]))}
      >
        <DatePickerInput
          id="dateOfNotification"
          labelText="Date of notification"
          placeholder="yyyy-mm-dd"
          pattern="\d{4}-\d{2}-\d{2}"
          invalid={showErrors && dateOfNotification === ''}
          invalidText="Enter the date of notification"
        />
      </DatePicker>

      {isDeath && (
        <DatePicker datePickerType="single" dateFormat="Y-m-d" value={today} readOnly>
          <DatePickerInput id="dateOfAudit" labelText={<AutoLabel text="Date of audit" />} placeholder="yyyy-mm-dd"
          pattern="\d{4}-\d{2}-\d{2}" />
        </DatePicker>
      )}
    </div>
  );
}

export default DateFields;
