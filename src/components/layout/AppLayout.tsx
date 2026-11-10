import { Content, Theme } from '@carbon/react';
import { Outlet } from 'react-router';
import Topbar from './topbar/Topbar';


function AppLayout() {
  return (
    <>
      <Topbar />
      <Theme as={Content} theme="g10">
        <Outlet />
      </Theme>
    </>
  );
}

export default AppLayout;
