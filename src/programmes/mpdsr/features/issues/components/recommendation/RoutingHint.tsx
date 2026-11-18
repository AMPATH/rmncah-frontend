import { InlineNotification } from '@carbon/react';
import type { Level } from '../../types/issue.types';
import { useApiData } from '../../../../hooks/useApiData';
import { daysText, defaultEscalationMatrix, getEscalationMatrix } from '../../../recommendations/services/escalationMatrix';

interface RoutingHintProps {
  level: Level | '';
}

function RoutingHint({ level }: RoutingHintProps) {
  const { data: matrix } = useApiData(getEscalationMatrix, defaultEscalationMatrix);

  if (level === '') {
    return null;
  }

  const needsAcceptance = level === 'sub-county' || level === 'county';

  return (
    <div className="form-block">
      <InlineNotification
        kind={needsAcceptance ? 'warning' : 'info'}
        lowContrast
        hideCloseButton
        title={needsAcceptance ? 'Needs acceptance' : 'Auto-assigned'}
        subtitle={
          needsAcceptance
            ? `The responsible person must accept within ${daysText(matrix[level])}. Reminders go out daily, then it auto-escalates to the PCN coordinator.`
            : 'No acceptance needed. It goes straight to the responsible person as Open.'
        }
      />
    </div>
  );
}

export default RoutingHint;
