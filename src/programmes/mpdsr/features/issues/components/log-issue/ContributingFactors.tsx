import { Checkbox, InlineNotification } from '@carbon/react';
import type { DelayLevel } from '../../constants/delayFactors';
import { delaysMissing } from '../../utils/delayRecommendations';
import './ContributingFactors.scss';

interface ContributingFactorsProps {
  delayLevels: DelayLevel[];
  selectedFactors: string[];
  showErrors: boolean;
  onToggleFactor: (factor: string) => void;
}

function ContributingFactors({
  delayLevels,
  selectedFactors,
  showErrors,
  onToggleFactor,
}: ContributingFactorsProps) {
  const missing = delaysMissing(selectedFactors);

  return (
    <div className="contributing-factors">
      <p className="contributing-factors__label">Contributing factors by level of delay</p>
      <p className="field-hint">
        Tick at least one factor in each level of delay. Each level of delay gets its own recommendation.
      </p>

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

      {showErrors && missing.length > 0 && (
        <InlineNotification
          kind="error"
          lowContrast
          hideCloseButton
          title="Tick at least one factor in each level of delay"
          subtitle={`Nothing ticked yet for: ${missing.map((delay) => `${delay} delay`).join(', ')}.`}
        />
      )}
    </div>
  );
}

export default ContributingFactors;
