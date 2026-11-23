import { Fragment, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
  Button,
  Header,
  HeaderContainer,
  HeaderGlobalAction,
  HeaderGlobalBar,
  HeaderMenuButton,
  HeaderName,
  HeaderPanel,
  Modal,
  SideNav,
  SideNavDivider,
  SideNavItems,
  SideNavLink,
  Select,
  SelectItem,
  SelectItemGroup,
  Theme,
} from '@carbon/react';
import type { CarbonIconType } from '@carbon/icons-react';
import {
  DocumentAdd,
  Edit,
  Home,
  Location,
  Logout,
  Notification,
  Report,
  Time,
  Timer,
  UserAvatar,
  UserMultiple,
  UserProfile,
} from '@carbon/icons-react';
import { useCurrentUser } from '../../../context/currentUserContext';
import { canAny, roleLabels } from '../../../auth/permissions';
import { permissionsForPath } from '../../../auth/pageAccess';
import { useApiData } from '../../../hooks/useApiData';
import { LARGE_SCREEN_QUERY, useMediaQuery } from '../../../hooks/useMediaQuery';
import { NOTIFICATIONS_CHANGED_EVENT, getNotifications } from '../../../features/notifications/services/notificationService';
import type { AppNotification } from '../../../features/notifications/types/notification.types';
import { showToast } from '../../shared/toast/toast';
import { initialsOf } from '../../../features/profile/utils/profileFigures';
import { actingAsGroups } from './actingAsGroups';
import './MPDSRTopbar.scss';

interface NavItem {
  path: string;
  label: string;
  icon: CarbonIconType;
}

const navGroups: NavItem[][] = [
  [
    { path: '/mpdsr', label: 'Overview', icon: Home },
    { path: '/issues/new', label: 'Log issue', icon: DocumentAdd },
  ],
  [
    { path: '/issues', label: 'Issues', icon: Edit },
    { path: '/actions/overdue', label: 'Overdue and reassign', icon: Time },
  ],
  [{ path: '/reports', label: 'Reports', icon: Report }],
  [
    { path: '/admin/users', label: 'Users', icon: UserMultiple },
    { path: '/admin/places', label: 'Locations', icon: Location },
    { path: '/admin/escalation', label: 'Escalation matrix', icon: Timer },
  ],
];

interface HeaderContentProps {
  isSideNavExpanded: boolean;
  onClickSideNavExpand: () => void;
}

function HeaderContent({ isSideNavExpanded, onClickSideNavExpand }: HeaderContentProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  
  const isLargeScreen = useMediaQuery(LARGE_SCREEN_QUERY);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, users, locations, setCurrentUserId } = useCurrentUser();

  
  const visibleGroups = navGroups
    .map((group) => group.filter((item) => canAny(currentUser, permissionsForPath(item.path))))
    .filter((group) => group.length > 0);

  
  const { data: myNotifications, reload: reloadNotifications } = useApiData<AppNotification[]>(
    () => getNotifications(currentUser?.id ?? ''),
    [],
    [currentUser?.id, location.pathname]
  );
  const unreadCount = myNotifications.filter((notification) => !notification.read).length;

  useEffect(() => {
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, reloadNotifications);
    return () => window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, reloadNotifications);
  });

  
  function handleLogout() {
    setProfileOpen(false);
    setConfirmingLogout(true);
  }

  function confirmLogout() {
    setConfirmingLogout(false);
    setCurrentUserId('');
    navigate('/');
    showToast('You are logged out.');
  }

  function handleSwitchUser(id: string) {
    setProfileOpen(false);
    if (id === '') {
      handleLogout();
      return;
    }
    setCurrentUserId(id);
    navigate('/mpdsr');
    const name = users.find((user) => user.id === id)?.fullName ?? 'the new user';
    showToast(`Signed out. Now signed in as ${name}.`);
  }

  return (
    <>
    <Header aria-label="MPDSR" className="topbar">
      {}
      <HeaderMenuButton
        aria-label={isSideNavExpanded ? 'Close menu' : 'Open menu'}
        isActive={isSideNavExpanded}
        onClick={onClickSideNavExpand}
      />

      <HeaderName as={Link} to="/mpdsr" prefix="">
        MPDSR
      </HeaderName>

      <HeaderGlobalBar>
        <HeaderGlobalAction
          aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
          isActive={location.pathname === '/notifications'}
          onClick={() => navigate('/notifications')}
        >
          <span className="bell">
            <Notification size={20} />
            {unreadCount > 0 && (
              <span className="bell__badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </span>
        </HeaderGlobalAction>
        <HeaderGlobalAction
          aria-label={profileOpen ? 'Close profile' : 'Profile'}
          isActive={profileOpen}
          onClick={() => setProfileOpen(!profileOpen)}
          tooltipAlignment="end"
        >
          <UserAvatar size={20} />
        </HeaderGlobalAction>
      </HeaderGlobalBar>

      <HeaderPanel expanded={profileOpen} className="profile-panel">
        {}
        <div inert={profileOpen === false}>
        <div className="profile-panel__user">
          <span className="profile-panel__avatar" aria-hidden="true">
            {currentUser ? initialsOf(currentUser.fullName) : <UserAvatar size={20} />}
          </span>
          <div>
            <p className="profile-panel__name">{currentUser?.fullName ?? 'Not signed in'}</p>
            {currentUser ? (
              <>
                <p className="profile-panel__role">{roleLabels[currentUser.role]}</p>
                <p className="profile-panel__role">{currentUser.assignedLocations.join(', ')}</p>
                {currentUser.email && <p className="profile-panel__role">{currentUser.email}</p>}
              </>
            ) : (
              <p className="profile-panel__role">Choose a user below</p>
            )}
          </div>
        </div>

        {currentUser && (
          <Button
            className="profile-panel__button"
            kind="ghost"
            renderIcon={UserProfile}
            onClick={() => {
              setProfileOpen(false);
              navigate('/profile');
            }}
          >
            View my profile
          </Button>
        )}

        {}
        <div className="profile-panel__acting-as">
          <Select
            id="actingAs"
            labelText="Acting as (testing)"
            size="sm"
            value={currentUser?.id ?? ''}
            onChange={(event) => handleSwitchUser(event.target.value)}
            helperText={users.length === 0 ? 'No users yet. Add them under "users" in mpdsrdb.json.' : undefined}
          >
            <SelectItem value="" text="Choose a user" />
            {actingAsGroups(users, locations).map((group) => (
              <SelectItemGroup key={group.label} label={group.label}>
                {group.options.map((option) => (
                  <SelectItem key={option.id} value={option.id} text={option.text} />
                ))}
              </SelectItemGroup>
            ))}
          </Select>
        </div>

        <Button
          className="profile-panel__button"
          kind="danger--ghost"
          renderIcon={Logout}
          onClick={handleLogout}
        >
          Log out
        </Button>
        </div>
      </HeaderPanel>

      {}
      <Theme theme="white">
        <SideNav
          aria-label="MPDSR navigation"
          expanded={isSideNavExpanded || isLargeScreen}
          onSideNavBlur={isLargeScreen ? undefined : onClickSideNavExpand}
          className="side-nav"
        >
          <SideNavItems>
            {visibleGroups.map((group, index) => (
              <Fragment key={group[0].path}>
                {index > 0 && <SideNavDivider />}
                {group.map((item) => (
                  <SideNavLink
                    key={item.path}
                    as={Link}
                    to={item.path}
                    renderIcon={item.icon}
                    isActive={location.pathname === item.path}
                  >
                    {item.label}
                  </SideNavLink>
                ))}
              </Fragment>
            ))}
          </SideNavItems>
        </SideNav>
      </Theme>
    </Header>

    <Theme theme="white">
      <Modal
        open={confirmingLogout}
        danger
        size="xs"
        modalHeading="Log out?"
        primaryButtonText="Log out"
        secondaryButtonText="Stay signed in"
        onRequestClose={() => setConfirmingLogout(false)}
        onRequestSubmit={confirmLogout}
      >
        <p>
          {currentUser ? `You are signed in as ${currentUser.fullName}. ` : ''}
          You will need to sign in again to continue.
        </p>
      </Modal>
    </Theme>
    </>
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
