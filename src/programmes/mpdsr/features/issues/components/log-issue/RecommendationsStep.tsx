import { InlineNotification, Tag, TextArea } from '@carbon/react';
import { delayGaps } from '../../utils/delayRecommendations';
import './RecommendationsStep.scss';

interface RecommendationsStepProps {
  selectedFactors: string[];
  texts: Record<string, string>;
  showErrors: boolean;
  onTextChange: (delay: string, text: string) => void;
}

// The person logging the issue writes one recommendation for each level of delay.
// The gap is filled in from the factors ticked earlier. The classification, date of completion,
// level and responsible person are set by the facility MPDSR chair at the case review.
function RecommendationsStep({ selectedFactors, texts, showErrors, onTextChange }: RecommendationsStepProps) {
  const gaps = delayGaps(selectedFactors);

  return (
    <>
      <InlineNotification
        kind="info"
        lowContrast
        hideCloseButton
        title="One recommendation for each level of delay"
        subtitle="The facility MPDSR chair sets the classification, date of completion and responsible person at the case review."
      />

      {gaps.map((item) => (
        <div key={item.delay} className="recommendations-step__delay">
          <h3 className="recommendations-step__title">
            {item.delay} delay · {item.title}
          </h3>
          <div className="recommendations-step__factors">
            <span className="recommendations-step__gap">Gap identified</span>
            {item.factors.map((factor) => (
              <Tag key={factor} type="cool-gray" size="sm">
                {factor}
              </Tag>
            ))}
          </div>
          <TextArea
            id={`recommendation-${item.delay}`}
            labelText={`Recommendation for the ${item.delay} delay`}
            rows={3}
            value={texts[item.delay] ?? ''}
            onChange={(event) => onTextChange(item.delay, event.target.value)}
            invalid={showErrors && (texts[item.delay] ?? '').trim() === ''}
            invalidText="Write the recommendation for this delay"
          />
        </div>
      ))}
    </>
  );
}

export default RecommendationsStep;
