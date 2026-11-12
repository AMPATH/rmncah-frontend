import { InlineNotification } from '@carbon/react';

interface NoAccessProps {
  signedIn: boolean;
}

// Shown instead of a page the current user's role can't open.
function NoAccess({ signedIn }: NoAccessProps) {
  return (
    <div className="page">
      <InlineNotification
        kind="warning"
        lowContrast
        hideCloseButton
        title={signedIn ? "You don't have access to this page" : 'Choose a user first'}
        subtitle={
          signedIn
            ? 'Your role does not include this task. Use the menu on the left.'
            : 'Open the profile icon (top right) and pick a user under "Acting as".'
        }
      />
    </div>
  );
}

export default NoAccess;
