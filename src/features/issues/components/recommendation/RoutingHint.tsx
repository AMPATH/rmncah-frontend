import { InlineNotification } from '@carbon/react';
import type { Level } from '../../types/issue.types';

interface RoutingHintProps {
  level: Level | '';
}

// Explains what happens after saving, based on the level of implementation.
function RoutingHint({ level }: RoutingHintProps) {
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
            ? 'The responsible person must accept within 3 days. Reminders go out daily, then it auto-escalates to the PCN coordinator.'
            : 'No acceptance needed. It goes straight to the responsible person as Open.'
        }
      />
    </div>
  );
}

export default RoutingHint;
