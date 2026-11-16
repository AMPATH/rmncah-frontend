import { ProgressIndicator, ProgressStep } from '@carbon/react';
import type { RecommendationStatus } from '../../issues/types/issue.types';

// The usual path of a recommendation. "Pending acceptance" only applies to sub-county and
// county recommendations, and "Overdue" is shown as a warning on the step it was at.
const stages: RecommendationStatus[] = [
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
  const shown = needsAcceptance ? stages : stages.filter((stage) => stage !== 'Pending acceptance');
  // An overdue recommendation is still in progress, just late.
  const current = status === 'Overdue' ? 'In progress' : status;
  const index = shown.indexOf(current);

  return (
    <ProgressIndicator currentIndex={index} spaceEqually className="lifecycle-bar">
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
