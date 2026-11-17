import { Checkbox, InlineNotification } from '@carbon/react';
import type { DelayLevel } from '../../constants/delayFactors';
import './ContributingFactors.scss';

interface ContributingFactorsProps {
  delayLevels: DelayLevel[];
  selectedFactors: string[];
  showErrors: boolean;
  onToggleFactor: (factor: string) => void;
}

// Step 3: contributing factors, grouped by level of delay. A case can have factors at
// more than one level. Each factor is stored as "1st delay: Poverty", so "Any other
// factor" at two levels stays two different choices.
function ContributingFactors({
  delayLevels,
  selectedFactors,
  showErrors,
  onToggleFactor,
}: ContributingFactorsProps) {
  return (
    <div className="contributing-factors">
      <p className="contributing-factors__label">Contributing factors by level of delay</p>
      <p className="field-hint">All three levels are shown; a case can have factors in more than one.</p>

      <div className="contributing-factors__groups">
        {delayLevels.map((level) => (
          <fieldset className="contributing-factors__group" key={level.id}>
            <legend className="contributing-factors__legend">
              {level.id} delay · {level.title}
            </legend>
            {level.factors.map((factor) => {
              const value = `${level.id} delay: ${factor}`;
              return (
                <Checkbox
                  key={value}
                  id={`factor-${level.id}-${factor}`}
                  labelText={factor}
                  checked={selectedFactors.includes(value)}
                  onChange={() => onToggleFactor(value)}
                />
              );
            })}
          </fieldset>
        ))}
      </div>

      {showErrors && selectedFactors.length === 0 && (
        <InlineNotification
          kind="error"
          lowContrast
          hideCloseButton
          title="Select at least one contributing factor"
        />
      )}
    </div>
  );
}

export default ContributingFactors;
