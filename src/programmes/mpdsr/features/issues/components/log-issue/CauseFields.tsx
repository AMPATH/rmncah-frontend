import { ComboBox } from '@carbon/react';

interface CauseFieldsProps {
  isDeath: boolean;
  causeOfDeath: string;
  causeOptions: string[];
  onCauseOfDeathChange: (value: string) => void;
}

// Step 3, first row: Cause of death (ICD-11), full width. Only shown for a death.
function CauseFields({ isDeath, causeOfDeath, causeOptions, onCauseOfDeathChange }: CauseFieldsProps) {
  // A near miss has no cause of death.
  if (!isDeath) {
    return null;
  }

  return (
    <div className="form-block">
      <ComboBox
        id="causeOfDeath"
        titleText="Cause of death (ICD-11)"
        placeholder="Type a code or a word, e.g. haem"
        items={causeOptions}
        selectedItem={causeOfDeath || null}
        shouldFilterItem={({ item, inputValue }) =>
          item.toLowerCase().includes((inputValue ?? '').toLowerCase())
        }
        onChange={({ selectedItem }) => onCauseOfDeathChange(selectedItem ?? '')}
        helperText={
          causeOptions.length === 0
            ? 'Searchable. No ICD-11 list yet.'
            : 'Searchable. Type a code or a word, e.g. "haem".'
        }
        required={causeOptions.length > 0}
      />
    </div>
  );
}

export default CauseFields;
