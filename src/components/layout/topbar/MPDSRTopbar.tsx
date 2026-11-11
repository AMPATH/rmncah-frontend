import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
  Button,
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
import {
  ArrowLeft,
  Logout,
  Notification,
  Switcher as SwitcherIcon,
} from '@carbon/icons-react';
import './MPDSRTopbar.scss';

const pages = [
  { path: '/mpdsr', label: 'MPDSR' },
  { path: '/issues/new', label: 'Log issue' },
  { path: '/issues/draft/recommendation', label: 'Recommendation' },
  { path: '/actions/draft/respond', label: 'Accept or escalate' },
  { path: '/actions/overdue', label: 'Overdue and reassign' },
  { path: '/actions/draft/close', label: 'Close out' },
  { path: '/dashboard', label: 'Dashboard and reports' },
];

function HeaderContent() {
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  function goTo(path: string) {
    navigate(path);
    setSwitcherOpen(false);
  }

  // Go to the previous page in the browser history.
  function handleBack() {
    navigate(-1);
  }

  // No sign-in yet: for now, go back to the programme choice.
  function handleLogout() {
    console.log('Log out');
    navigate('/');
  }

  return (
    <Header aria-label="MPDSR" className="topbar">
      <Button
        className="topbar__button"
        kind="ghost"
        size="md"
        renderIcon={ArrowLeft}
        onClick={handleBack}
      >
        Back
      </Button>

      <HeaderName as={Link} to="/mpdsr" prefix="">
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
        <Button
          className="topbar__button"
          kind="ghost"
          size="md"
          renderIcon={Logout}
          onClick={handleLogout}
        >
          Log out
        </Button>
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
