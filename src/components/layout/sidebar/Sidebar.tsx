
import { useState } from 'react'

import type { RoleNavigation } from '../../../config/navigation/navigation.types'

import SidebarBrand from './SidebarBrand'
import SidebarNavigation from './SidebarNavigation'

import './Sidebar.scss'

interface SidebarProps {
  navigation: RoleNavigation
  activePath: string
  onNavigate: (path: string) => void
  mobileOpen: boolean
  onClose: () => void
}

const roleShortLabels: Record<string, string> = {
  'county-mentor': 'CM',
  mentor: 'M',
  mentee: 'ME',
  admin: 'SA',
}

export default function Sidebar({
  navigation,
  activePath,
  onNavigate,
  mobileOpen,
  onClose,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  function toggleSidebar() {
    setCollapsed((previous) => !previous)
  }

  const roleLabel = navigation.title
  const roleShortLabel = roleShortLabels[navigation.role] ?? 'U'

  return (
    <aside
      id="emonc-sidebar"
      className={[
        'sidebar',
        collapsed ? 'sidebar--collapsed' : '',
        mobileOpen ? 'sidebar--mobile-open' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={`${roleLabel} navigation`}
      aria-hidden={!mobileOpen && typeof window !== 'undefined' && window.innerWidth <= 700}
    >
      <SidebarBrand
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={toggleSidebar}
        onMobileClose={onClose}
      />

      <SidebarNavigation
        navigation={navigation}
        activePath={activePath}
        collapsed={collapsed}
        onNavigate={onNavigate}
      />

      <div className="sidebar__footer">
        <div className="sidebar__user">
          <div className="sidebar__user-avatar">
            {roleShortLabel}
          </div>

          <div className="sidebar__user-info">
            <strong>{roleLabel}</strong>
            <span>EmONC Workspace</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
