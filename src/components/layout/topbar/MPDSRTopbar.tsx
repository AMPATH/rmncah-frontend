import { useEffect, useState } from 'react';
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
  SideNav,
  SideNavDivider,
  SideNavItems,
  SideNavLink,
  Select,
  SelectItem,
  Theme,
} from '@carbon/react';
import type { CarbonIconType } from '@carbon/icons-react';
import {
  DocumentAdd,
  Edit,
  Home,
  Logout,
  Notification,
  Report,
  Time,
  UserAvatar,
} from '@carbon/icons-react';
import { useCurrentUser } from '../../../auth/CurrentUserContext';
import { canAny, roleLabels } from '../../../auth/permissions';
import { permissionsForPath } from '../../../auth/pageAccess';
import { useApiData } from '../../../hooks/useApiData';
import { NOTIFICATIONS_CHANGED_EVENT, getNotifications } from '../../../features/notifications/services/notificationService';
import type { AppNotification } from '../../../features/notifications/types/notification.types';
import './MPDSRTopbar.scss';

interface NavItem {
  path: string;
  label: string;
  icon: CarbonIconType;
}

// The side navigation, in groups. A divider is drawn between groups.
const navGroups: NavItem[][] = [
  [
    { path: '/mpdsr', label: 'Overview', icon: Home },
    { path: '/issues/new', label: 'Log issue', icon: DocumentAdd },
  ],
  [
    { path: '/issues/draft/recommendation', label: 'Recommendation', icon: Edit },
    { path: '/actions/overdue', label: 'Overdue and reassign', icon: Time },
  ],
  [{ path: '/reports', label: 'Reports', icon: Report }],
];

interface HeaderContentProps {
  isSideNavExpanded: boolean;
  onClickSideNavExpand: () => void;
}

function HeaderContent({ isSideNavExpanded, onClickSideNavExpand }: HeaderContentProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, users, setCurrentUserId } = useCurrentUser();

  // Only the pages the current user's role can open; empty groups are dropped.
  const visibleGroups = navGroups
    .map((group) => group.filter((item) => canAny(currentUser, permissionsForPath(item.path))))
    .filter((group) => group.length > 0);

  // The bell's unread count. Refreshed on every page change and when notifications change.
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

  // No sign-in yet: Log out just returns to the start page.
  function handleLogout() {
    console.log('Log out');
    setProfileOpen(false);
    navigate('/');
  }

  return (
    <Header aria-label="MPDSR" className="topbar">
      {/* Opens the side navigation on small screens. On large screens it is always shown. */}
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
        <div className="profile-panel__user">
          <UserAvatar size={32} />
          <div>
            <p className="profile-panel__name">{currentUser?.fullName ?? 'Not signed in'}</p>
            <p className="profile-panel__role">
              {currentUser
                ? `${roleLabels[currentUser.role]} · ${currentUser.assignedLocations.join(', ')}`
                : 'Choose a user below'}
            </p>
          </div>
        </div>

        {/* Temporary, for testing roles until sign-in exists. */}
        <div className="profile-panel__acting-as">
          <Select
            id="actingAs"
            labelText="Acting as (testing)"
            size="sm"
            value={currentUser?.id ?? ''}
            onChange={(event) => setCurrentUserId(event.target.value)}
            helperText={users.length === 0 ? 'No users yet. Add them under "users" in db.json.' : undefined}
          >
            <SelectItem value="" text="Choose a user" />
            {users.map((user) => (
              <SelectItem
                key={user.id}
                value={user.id}
                text={`${user.fullName} · ${roleLabels[user.role]}`}
              />
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
      </HeaderPanel>

      {/* The side navigation uses the light theme, the header stays dark. */}
      <Theme theme="white">
        <SideNav
          aria-label="MPDSR navigation"
          expanded={isSideNavExpanded}
          onSideNavBlur={onClickSideNavExpand}
          className="side-nav"
        >
          <SideNavItems>
            {visibleGroups.map((group, index) => (
              <div key={group[0].path}>
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
              </div>
            ))}
          </SideNavItems>
        </SideNav>
      </Theme>
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
