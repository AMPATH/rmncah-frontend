
import { useEffect, useRef, useState } from 'react'

import {
  Search,
  Notification,
  ChevronDown,
  Checkmark,
  Menu,
  Close,
} from '@carbon/icons-react'

import { roles, type UserRole } from '../../../../../config/roles'
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
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false)

  const roleSwitcherRef = useRef<HTMLDivElement>(null)

  const selectedRole = roles.find(
    (role) => role.id === activeRole,
  )

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        roleSwitcherRef.current &&
        !roleSwitcherRef.current.contains(event.target as Node)
      ) {
        setIsRoleMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [])

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsRoleMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  function handleRoleSelection(role: UserRole) {
    onRoleChange(role)
    setIsRoleMenuOpen(false)
  }

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

        {/* Development role preview */}
        <div
          className="emonc-topbar__role-switcher"
          ref={roleSwitcherRef}
        >
          <button
            type="button"
            className={`emonc-topbar__role-trigger ${
              isRoleMenuOpen
                ? 'emonc-topbar__role-trigger--open'
                : ''
            }`}
            aria-label="Select application role"
            aria-expanded={isRoleMenuOpen}
            aria-haspopup="menu"
            onClick={() => setIsRoleMenuOpen((open) => !open)}
          >
            <span className="emonc-topbar__role-name">
              {selectedRole?.label ?? 'County Mentor / RH / MOH'}
            </span>

            <ChevronDown
              size={16}
              className={`emonc-topbar__chevron ${
                isRoleMenuOpen
                  ? 'emonc-topbar__chevron--open'
                  : ''
              }`}
            />
          </button>

          {isRoleMenuOpen && (
            <div
              className="emonc-topbar__role-menu"
              role="menu"
              aria-label="Switch application role"
            >
              <div className="emonc-topbar__role-menu-heading">
                SWITCH ROLE
              </div>

              {roles.map((role) => {
                const isActive = activeRole === role.id

                return (
                  <button
                    type="button"
                    key={role.id}
                    role="menuitemradio"
                    aria-checked={isActive}
                    className={`emonc-topbar__role-option ${
                      isActive
                        ? 'emonc-topbar__role-option--active'
                        : ''
                    }`}
                    onClick={() => handleRoleSelection(role.id)}
                  >
                    <span className="emonc-topbar__role-option-label">
                      <span>{role.label}</span>
                    </span>

                    {isActive && (
                      <Checkmark
                        size={16}
                        className="emonc-topbar__role-check"
                      />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Account profile menu */}
        <ProfileMenu activeRole={activeRole} />
      </div>
    </header>
  )
}
