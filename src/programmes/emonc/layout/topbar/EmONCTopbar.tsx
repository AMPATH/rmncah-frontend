
import {
  Search,
  Notification,
  Menu,
  Close,
} from '@carbon/icons-react'

import { type UserRole } from '../../config/roles'
import ProfileMenu from './profile/ProfileMenu'

import './EmONCTopbar.scss'

interface EmONCTopbarProps {
  pageTitle: string
  activeRole: UserRole
  onRoleChange: (role: UserRole) => void
  onMenuClick: () => void
  mobileMenuOpen: boolean
}

export default function EmONCTopbar({
  pageTitle,
  activeRole,
  onRoleChange,
  onMenuClick,
  mobileMenuOpen,
}: EmONCTopbarProps) {
  return (
    <header className="emonc-topbar">
      <button
        type="button"
        className="emonc-topbar__menu-button"
        onClick={onMenuClick}
        aria-label={
          mobileMenuOpen
            ? 'Close navigation menu'
            : 'Open navigation menu'
        }
        aria-expanded={mobileMenuOpen}
        aria-controls="emonc-sidebar"
      >
        {mobileMenuOpen ? (
          <Close size={22} />
        ) : (
          <Menu size={22} />
        )}
      </button>

      <div className="emonc-topbar__breadcrumb">
        <span>Workspace</span>

        <span className="emonc-topbar__breadcrumb-separator">
          /
        </span>

        <strong>{pageTitle}</strong>
      </div>

      <div className="emonc-topbar__actions">
        <button
          type="button"
          className="emonc-topbar__icon-button"
          aria-label="Search"
        >
          <Search size={20} />
        </button>

        <button
          type="button"
          className="emonc-topbar__icon-button"
          aria-label="Notifications"
        >
          <Notification size={20} />
        </button>

        <ProfileMenu
          activeRole={activeRole}
          onRoleChange={onRoleChange}
        />
      </div>
    </header>
  )
}
