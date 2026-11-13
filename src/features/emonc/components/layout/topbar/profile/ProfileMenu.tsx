
import { useEffect, useRef, useState } from 'react'

import {
  User,
  Settings,
  Logout,
  Close,
} from '@carbon/icons-react'

import { useNavigate } from 'react-router'

import { roles, type UserRole } from '../../../../../../config/roles'

import './ProfileMenu.scss'

interface ProfileMenuProps {
  activeRole: UserRole
}

function ProfileMenu({ activeRole }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] =
    useState(false)

  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const selectedRole = roles.find(
    (role) => role.id === activeRole,
  )

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
        setIsSignOutDialogOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  function handleSignOutClick() {
    setIsOpen(false)
    setIsSignOutDialogOpen(true)
  }

  function closeSignOutDialog() {
    setIsSignOutDialogOpen(false)
  }

  function handleConfirmSignOut() {
    setIsOpen(false)
    setIsSignOutDialogOpen(false)

    navigate('/', { replace: true })
  }

  return (
    <>
      <div className="emonc-profile-menu" ref={menuRef}>
        <button
          type="button"
          className={`emonc-profile-menu__trigger ${
            isOpen ? 'emonc-profile-menu__trigger--open' : ''
          }`}
          aria-label="Open account menu"
          aria-expanded={isOpen}
          aria-haspopup="menu"
          onClick={() => setIsOpen((previous) => !previous)}
        >
          <User size={20} />
        </button>

        {isOpen && (
          <div
            className="emonc-profile-menu__dropdown"
            role="menu"
            aria-label="Account options"
          >
            <div className="emonc-profile-menu__account">
              <User size={24} />

              <div>
                <strong>Demo account</strong>
                <span>
                  {selectedRole?.label ?? 'Demo workspace'}
                </span>
              </div>
            </div>

            <div className="emonc-profile-menu__divider" />

            <button
              type="button"
              className="emonc-profile-menu__item"
              role="menuitem"
              disabled
              title="Profile page is not available yet"
            >
              <User size={18} />
              <span>My Profile</span>
              <small>Coming soon</small>
            </button>

            <button
              type="button"
              className="emonc-profile-menu__item"
              role="menuitem"
              disabled
              title="Settings page is not available yet"
            >
              <Settings size={18} />
              <span>Account Settings</span>
              <small>Coming soon</small>
            </button>

            <div className="emonc-profile-menu__divider" />

            <button
              type="button"
              className="emonc-profile-menu__item emonc-profile-menu__item--signout"
              role="menuitem"
              onClick={handleSignOutClick}
            >
              <Logout size={18} />
              <span>Sign Out</span>
            </button>

            <div className="emonc-profile-menu__footer">
              DEMO ENVIRONMENT
            </div>
          </div>
        )}
      </div>

      {isSignOutDialogOpen && (
        <div
          className="emonc-profile-dialog-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeSignOutDialog()
            }
          }}
        >
          <section
            className="emonc-profile-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="emonc-signout-title"
            aria-describedby="emonc-signout-description"
          >
            <button
              type="button"
              className="emonc-profile-dialog__close"
              aria-label="Close confirmation"
              onClick={closeSignOutDialog}
            >
              <Close size={18} />
            </button>

            <div className="emonc-profile-dialog__icon">
              <Logout size={22} />
            </div>

            <h2 id="emonc-signout-title">
              Are you sure you want to sign out?
            </h2>

            <p id="emonc-signout-description">
              You will be returned to the programme selection page.
              No authentication session will be terminated in demo mode.
            </p>

            <div className="emonc-profile-dialog__actions">
              <button
                type="button"
                className="emonc-profile-dialog__button emonc-profile-dialog__button--cancel"
                onClick={closeSignOutDialog}
              >
                No
              </button>

              <button
                type="button"
                className="emonc-profile-dialog__button emonc-profile-dialog__button--confirm"
                onClick={handleConfirmSignOut}
              >
                Yes
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  )
}

export default ProfileMenu
