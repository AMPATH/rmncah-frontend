import { InlineNotification } from '@carbon/react';
import InfoList from '../../../../components/shared/InfoList';
import type { InfoItem } from '../../../../components/shared/InfoList';

interface ReviewStepProps {
  items: InfoItem[];
  recommendationCount: number;
}

// Step 6: everything entered, shown once more before submitting.
function ReviewStep({ items, recommendationCount }: ReviewStepProps) {
  return (
    <>
      <InfoList items={items} />
      <InlineNotification
        kind="info"
        lowContrast
        hideCloseButton
        title="On submit"
        subtitle={`The system creates the issue ID and ${recommendationCount} recommendation ID(s), routes each recommendation and sends the notifications.`}
      />
    </>
  );
}

export default ReviewStep;
