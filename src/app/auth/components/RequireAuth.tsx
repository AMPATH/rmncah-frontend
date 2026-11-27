import { Navigate, Outlet, useLocation } from 'react-router';
import { Button, InlineLoading, InlineNotification } from '@carbon/react';
import { useAuth } from '../hooks/useAuth';
import '../auth.scss';

// Wraps every page that needs a signed-in user. Signed-out visitors go to /login
// and come back to the page they asked for after signing in.
function RequireAuth() {
  const { state, retry } = useAuth();
  const location = useLocation();

  if (state.status === 'checking') {
    return (
      <div className="auth-wait">
        <InlineLoading description="Checking your session..." />
      </div>
    );
  }

  if (state.status === 'unreachable') {
    return (
      <div className="auth-wait">
        <InlineNotification kind="error" title="Can't load your session" subtitle={state.message} hideCloseButton lowContrast />
        <Button kind="tertiary" size="md" onClick={retry}>
          Try again
        </Button>
      </div>
    );
  }

  if (state.status === 'signedOut') {
    const from = location.pathname + location.search;
    const keepPlace = state.notice === undefined || state.keepPlace === true;
    return <Navigate to="/login" replace state={{ notice: state.notice, from: keepPlace ? from : undefined }} />;
  }

  // A new account, or one an admin reset, must choose its own password first.
  if (state.user.mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  return <Outlet />;
}

export default RequireAuth;
