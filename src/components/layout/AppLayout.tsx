import { Content, Theme } from '@carbon/react';
import { Outlet, useLocation } from 'react-router';
import MPDSRTopbar from './topbar/MPDSRTopbar';
import ToastHost from '../shared/toast/ToastHost';
import BackButton from './BackButton';
import { CurrentUserProvider, useCurrentUser } from '../../auth/CurrentUserContext';
import { canAny } from '../../auth/permissions';
import { permissionsForPath } from '../../auth/pageAccess';
import NoAccess from './NoAccess';
import './AppLayout.scss';

// Pages that put the Back button in their own button row (so it isn't shown twice).
const pagesWithOwnBackButton = ['/issues/new'];

// The page, or a "no access" message if the current user's role can't open it.
function GuardedPage() {
  const { pathname } = useLocation();
  const { currentUser, ready } = useCurrentUser();
  const needed = permissionsForPath(pathname);

  if (ready && needed.length > 0 && !canAny(currentUser, needed)) {
    return <NoAccess signedIn={currentUser !== null} />;
  }
  return <Outlet />;
}

function AppLayout() {
  const { pathname } = useLocation();

  return (
    <CurrentUserProvider>
      {/* Every MPDSR style is scoped to this wrapper, so none of it reaches EmONC. */}
      <div className="mpdsr-app">
        <MPDSRTopbar />
        <Theme as={Content} theme="g10" className="app-content">
          <GuardedPage />
          {!pagesWithOwnBackButton.includes(pathname) && <BackButton />}
        </Theme>
        <ToastHost />
      </div>
    </CurrentUserProvider>
  );
}

export default AppLayout;
