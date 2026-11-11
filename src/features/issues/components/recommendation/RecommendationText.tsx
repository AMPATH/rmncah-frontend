import { TextArea } from '@carbon/react';

interface RecommendationTextProps {
  text: string;
  onTextChange: (value: string) => void;
}

// The recommendation itself: what should be done to close the gap.
function RecommendationText({ text, onTextChange }: RecommendationTextProps) {
  return (
    <div className="form-block">
      <TextArea
        id="recommendationText"
        labelText="Recommendation"
        helperText="Describe the action needed to close the gap."
        placeholder=""
        rows={4}
        enableCounter
        maxCount={500}
        value={text}
        onChange={(event) => onTextChange(event.target.value)}
        required
      />
    </div>
  );
}

export default RecommendationText;
