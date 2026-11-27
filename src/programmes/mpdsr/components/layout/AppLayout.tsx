import { Content, Theme } from '@carbon/react';
import { Fragment } from 'react';
import { Outlet, useLocation } from 'react-router';
import MPDSRTopbar from './topbar/MPDSRTopbar';
import ToastHost from '../shared/toast/ToastHost';
import BackButton from './BackButton';
import { CurrentUserProvider } from '../../context/CurrentUserProvider';
import { useCurrentUser } from '../../context/currentUserContext';
import { canAny } from '../../auth/permissions';
import { permissionsForPath } from '../../auth/pageAccess';
import NoAccess from './NoAccess';
import './AppLayout.scss';

const pagesWithOwnBackButton = ['/issues/new', '/mpdsr'];

function GuardedPage() {
  const { pathname } = useLocation();
  const { currentUser, ready } = useCurrentUser();
  const needed = permissionsForPath(pathname);

  if (ready && currentUser === null) {
    return <NoAccess noRole />;
  }
  if (ready && currentUser?.active === false) {
    return <NoAccess deactivated />;
  }
  if (ready && needed.length > 0 && !canAny(currentUser, needed)) {
    return <NoAccess />;
  }
  return (
    <Fragment key={currentUser?.id}>
      <Outlet />
    </Fragment>
  );
}

function AppLayout() {
  const { pathname } = useLocation();

  return (
    <CurrentUserProvider>
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
