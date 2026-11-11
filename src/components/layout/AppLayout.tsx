import { Content, Theme } from '@carbon/react';
import { Outlet } from 'react-router';
import MPDSRTopbar from './topbar/MPDSRTopbar';


function AppLayout() {
  return (
    <>
      <MPDSRTopbar />
      <Theme as={Content} theme="g10">
        <Outlet />
      </Theme>
    </>
  );
}

export default AppLayout;
