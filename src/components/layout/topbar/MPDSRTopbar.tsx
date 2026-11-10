import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
  Header,
  HeaderContainer,
  HeaderGlobalAction,
  HeaderGlobalBar,
  HeaderName,
  HeaderPanel,
  Switcher,
  SwitcherItem,
  Theme,
} from '@carbon/react';
import { Notification, Switcher as SwitcherIcon } from '@carbon/icons-react';
import './MPDSRTopbar.scss';

const pages = [
  { path: '/my-work', label: 'My work' },
  { path: '/issues/new', label: 'Log issue' },
];

function HeaderContent() {
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  function goTo(path: string) {
    navigate(path);
    setSwitcherOpen(false);
  }

  return (
    <Header aria-label="MPDSR" className="topbar">
      <HeaderName as={Link} to="/my-work" prefix="">
        MPDSR
      </HeaderName>

      <HeaderGlobalBar>
        <HeaderGlobalAction aria-label="Notifications">
          <Notification size={20} />
        </HeaderGlobalAction>
        <HeaderGlobalAction
          aria-label={switcherOpen ? 'Close pages' : 'Open pages'}
          isActive={switcherOpen}
          onClick={() => setSwitcherOpen(!switcherOpen)}
          tooltipAlignment="end"
        >
          <SwitcherIcon size={20} />
        </HeaderGlobalAction>
      </HeaderGlobalBar>

      <HeaderPanel expanded={switcherOpen}>
        <Switcher aria-label="Pages" expanded={switcherOpen}>
          {pages.map((page) => (
            <SwitcherItem
              key={page.path}
              aria-label={page.label}
              href={page.path}
              isSelected={location.pathname === page.path}
              onClick={(event) => {
                event.preventDefault();
                goTo(page.path);
              }}
            >
              {page.label}
            </SwitcherItem>
          ))}
        </Switcher>
      </HeaderPanel>
    </Header>
  );
}

function MPDSRTopbar() {
  return (
    <Theme theme="g100">
      <HeaderContainer render={HeaderContent} />
    </Theme>
  );
}

export default MPDSRTopbar;
