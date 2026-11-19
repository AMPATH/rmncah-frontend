import { InlineNotification } from '@carbon/react';
import InfoList from '../../../../components/shared/InfoList';
import type { InfoItem } from '../../../../components/shared/InfoList';

interface ReviewStepProps {
  items: InfoItem[];
  recommendationCount: number;
}

function ReviewStep({ items, recommendationCount }: ReviewStepProps) {
  return (
    <>
      <InfoList items={items} />
      <InlineNotification
        kind="info"
        lowContrast
        hideCloseButton
        title="On submit"
        subtitle={`The system creates the issue ID and ${recommendationCount} recommendation ID(s). The facility MPDSR chair reviews the case first; only then is each recommendation sent to its responsible person.`}
      />
    </>
  );
}

export default ReviewStep;
