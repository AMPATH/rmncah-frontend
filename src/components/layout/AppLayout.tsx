import { Content, Theme } from '@carbon/react';
import { Outlet } from 'react-router';
import MPDSRTopbar from './topbar/MPDSRTopbar';
import ToastHost from '../shared/toast/ToastHost';


function AppLayout() {
  return (
    <>
      <MPDSRTopbar />
      <Theme as={Content} theme="g10">
        <Outlet />
      </Theme>
      <ToastHost />
    </>
  );
}

export default AppLayout;
