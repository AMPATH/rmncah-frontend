import { Checkbox, InlineLoading, InlineNotification } from '@carbon/react';
import type { DelayLevel } from '../../constants/delayFactors';
import { delaysMissing } from '../../utils/delayRecommendations';
import './ContributingFactors.scss';

interface ContributingFactorsProps {
  delayLevels: DelayLevel[];
  selectedFactors: string[];
  showErrors: boolean;
  onToggleFactor: (factor: string) => void;
  // The factors come from the backend: still loading, or it could not be reached.
  loading?: boolean;
  loadFailed?: boolean;
}

function ContributingFactors({
  delayLevels,
  selectedFactors,
  showErrors,
  onToggleFactor,
  loading = false,
  loadFailed = false,
}: ContributingFactorsProps) {
  const missing = delaysMissing(selectedFactors);

  return (
    <div className="contributing-factors">
      <p className="contributing-factors__label">Contributing factors by level of delay</p>
      <p className="field-hint">
        Tick at least one factor in each level of delay. Each level of delay gets its own recommendation.
      </p>

      {loading && <InlineLoading description="Loading contributing factors..." />}
      {loadFailed && (
        <InlineNotification
          kind="error"
          lowContrast
          hideCloseButton
          title="Couldn't load the contributing factors"
          subtitle="Check that the backend is running and that your account has an MPDSR role, then reload the page."
        />
      )}

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
