import { InlineNotification } from '@carbon/react';

interface NoAccessProps {
  signedIn: boolean;
  
  deactivated?: boolean;
}

function NoAccess({ signedIn, deactivated = false }: NoAccessProps) {
  if (deactivated) {
    return (
      <div className="page">
        <InlineNotification
          kind="error"
          lowContrast
          hideCloseButton
          title="This account is deactivated"
          subtitle="Ask the system administrator if you still need access."
        />
      </div>
    );
  }

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
