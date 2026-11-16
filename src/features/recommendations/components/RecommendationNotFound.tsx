import { InlineNotification } from '@carbon/react';

// Shown when the code doesn't exist or belongs to a place outside the user's responsibility.
function RecommendationNotFound() {
  return (
    <InlineNotification
      kind="warning"
      lowContrast
      hideCloseButton
      title="Recommendation not found"
      subtitle="It may not exist, or it belongs to a place outside your responsibility."
    />
  );
}

export default RecommendationNotFound;
