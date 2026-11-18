import { InlineNotification } from '@carbon/react';

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
