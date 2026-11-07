
import { useEffect, useRef, useState } from 'react'
import {
  Search,
  Notification,
  ChevronDown,
  Checkmark,
} from '@carbon/icons-react'

import { roles, type UserRole } from '../../../config/roles'
import './Topbar.scss'

interface TopbarProps {
  pageTitle: string
  activeRole: UserRole
  onRoleChange: (role: UserRole) => void
}

export default function Topbar({
  pageTitle,
  activeRole,
  onRoleChange,
}: TopbarProps) {
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false)
  const roleSwitcherRef = useRef<HTMLDivElement>(null)

  const selectedRole = roles.find(
    (role) => role.id === activeRole
  )

  // Close the dropdown when clicking outside it.
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

  // Close the dropdown when pressing Escape.
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
    <header className="topbar">
      <div className="topbar__breadcrumb">
        <span>Workspace</span>
        <span className="topbar__breadcrumb-separator">/</span>
        <strong>{pageTitle}</strong>
      </div>

      <div className="topbar__actions">
        <button
          type="button"
          className="topbar__icon-button"
          aria-label="Search"
        >
          <Search size={20} />
        </button>

        <button
          type="button"
          className="topbar__icon-button"
          aria-label="Notifications"
        >
          <Notification size={20} />
        </button>

        <div
          className="topbar__role-switcher"
          ref={roleSwitcherRef}
        >
          <button
            type="button"
            className={`topbar__role-trigger ${
              isRoleMenuOpen ? 'topbar__role-trigger--open' : ''
            }`}
            aria-label="Select application role"
            aria-expanded={isRoleMenuOpen}
            aria-haspopup="menu"
            onClick={() => setIsRoleMenuOpen((open) => !open)}
          >
            <span className="topbar__profile">
              {selectedRole?.shortLabel ?? 'CM'}
            </span>

            <span className="topbar__role-name">
              {selectedRole?.label ?? 'County Mentor / RH'}
            </span>

            <ChevronDown
              size={16}
              className={`topbar__chevron ${
                isRoleMenuOpen ? 'topbar__chevron--open' : ''
              }`}
            />
          </button>

          {isRoleMenuOpen && (
            <div
              className="topbar__role-menu"
              role="menu"
              aria-label="Switch application role"
            >
              <div className="topbar__role-menu-heading">
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
                    className={`topbar__role-option ${
                      isActive ? 'topbar__role-option--active' : ''
                    }`}
                    onClick={() => handleRoleSelection(role.id)}
                  >
                    <span className="topbar__role-option-label">
                      <span className="topbar__role-option-avatar">
                        {role.shortLabel}
                      </span>

                      <span>{role.label}</span>
                    </span>

                    {isActive && (
                      <Checkmark
                        size={16}
                        className="topbar__role-check"
                      />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
