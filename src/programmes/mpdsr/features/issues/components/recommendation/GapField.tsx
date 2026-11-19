import { Select, SelectItem } from '@carbon/react';

interface GapFieldProps {
  gap: string;
  gapOptions: string[];
  onGapChange: (value: string) => void;
}

function GapField({ gap, gapOptions, onGapChange }: GapFieldProps) {
  return (
    <div className="form-row">
      <Select
        id="gap"
        labelText="Gap identified"
        value={gap}
        onChange={(event) => onGapChange(event.target.value)}
        helperText={
          gapOptions.length === 0
            ? 'No contributing factors yet'
            : 'The contributing factor this recommendation addresses'
        }
        required
      >
        <SelectItem value="" text="Select gap" />
        {gapOptions.map((option) => (
          <SelectItem key={option} value={option} text={option} />
        ))}
      </Select>
    </div>
  );
}

export default GapField;
