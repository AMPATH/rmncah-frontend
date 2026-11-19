import { ProgressIndicator, ProgressStep } from '@carbon/react';
import type { RecommendationStatus } from '../../issues/types/issue.types';
import { PHONE_QUERY, useMediaQuery } from '../../../hooks/useMediaQuery';

const stages: RecommendationStatus[] = [
  'Pending review',
  'Open',
  'Pending acceptance',
  'In progress',
  'Pending approval',
  'Closed',
];

interface LifecycleBarProps {
  status: RecommendationStatus;
  needsAcceptance: boolean;
}

function LifecycleBar({ status, needsAcceptance }: LifecycleBarProps) {
  const isPhone = useMediaQuery(PHONE_QUERY);
  const shown = needsAcceptance ? stages : stages.filter((stage) => stage !== 'Pending acceptance');
  const current = status === 'Overdue' ? 'In progress' : status;
  const index = shown.indexOf(current);

  return (
    <ProgressIndicator currentIndex={index} spaceEqually={isPhone === false} vertical={isPhone} className="lifecycle-bar">
      {shown.map((stage) => (
        <ProgressStep
          key={stage}
          label={stage}
          invalid={status === 'Overdue' && stage === 'In progress'}
          secondaryLabel={status === 'Overdue' && stage === 'In progress' ? 'Overdue' : undefined}
        />
      ))}
    </ProgressIndicator>
  );
}

export default LifecycleBar;
