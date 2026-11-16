import { NumberInput, Select, SelectItem } from '@carbon/react';

interface PeriodDetailFieldsProps {
  periodOfDeath: string;
  gestationWeeks: string;
  daysPostpartum: string;
  onPeriodOfDeathChange: (value: string) => void;
  onGestationWeeksChange: (value: string) => void;
  onDaysPostpartumChange: (value: string) => void;
}

// Step 4, first row: Period of death, then gestation or days postpartum.
function PeriodDetailFields({
  periodOfDeath,
  gestationWeeks,
  daysPostpartum,
  onPeriodOfDeathChange,
  onGestationWeeksChange,
  onDaysPostpartumChange,
}: PeriodDetailFieldsProps) {
  return (
    <div className="form-row form-row--two">
      <Select
        id="periodOfDeath"
        labelText="Period of death"
        value={periodOfDeath}
        onChange={(event) => onPeriodOfDeathChange(event.target.value)}
        required
      >
        <SelectItem value="" text="Select period" />
        <SelectItem value="antenatal" text="Antenatal" />
        <SelectItem value="intrapartum" text="Intrapartum" />
        <SelectItem value="postpartum" text="Postpartum" />
      </Select>

      {periodOfDeath === 'postpartum' && (
        <NumberInput
          id="daysPostpartum"
          label="Days postpartum"
          helperText="0 to 42"
          min={0}
          max={42}
          allowEmpty
          value={daysPostpartum}
          invalidText="Enter a number from 0 to 42"
          onChange={(_event, { value }) => onDaysPostpartumChange(String(value))}
          required
        />
      )}

      {(periodOfDeath === 'antenatal' || periodOfDeath === 'intrapartum') && (
        <NumberInput
          id="gestationWeeks"
          label="Gestation at death (weeks)"
          min={1}
          max={45}
          allowEmpty
          value={gestationWeeks}
          invalidText="Enter a number from 1 to 45"
          onChange={(_event, { value }) => onGestationWeeksChange(String(value))}
          required
        />
      )}
    </div>
  );
}

export default PeriodDetailFields;
