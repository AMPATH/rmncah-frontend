import { InlineNotification } from '@carbon/react';

interface NoAccessProps {
  deactivated?: boolean;
  // Signed in, but no MPDSR user has this account's email.
  noRole?: boolean;
}

function NoAccess({ deactivated = false, noRole = false }: NoAccessProps) {
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

  if (noRole) {
    return (
      <div className="page">
        <InlineNotification
          kind="warning"
          lowContrast
          hideCloseButton
          title="Your account has no MPDSR role yet"
          subtitle={
            import.meta.env.DEV
              ? 'Add a user with your sign-in email to mpdsrdb.json, or pick one under "Acting as" (profile icon, top right).'
              : 'Ask the system administrator to give you an MPDSR role.'
          }
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
        title="You don't have access to this page"
        subtitle="Your role does not include this task. Use the menu on the left."
      />
    </div>
  );
}

export default NoAccess;
