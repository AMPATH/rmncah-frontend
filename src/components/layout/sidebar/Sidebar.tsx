
import { useState } from 'react'

import type { RoleNavigation } from '../../../config/navigation/navigation.types'

import SidebarBrand from './SidebarBrand'
import SidebarNavigation from './SidebarNavigation'

import './Sidebar.scss'

interface SidebarProps {
  navigation: RoleNavigation
  activePath: string
  onNavigate: (path: string) => void
}

const roleShortLabels: Record<string, string> = {
  'county-mentor': 'CM',
  mentor: 'M',
  mentee: 'ME',
  developer: 'SA',
}

export default function Sidebar({
  navigation,
  activePath,
  onNavigate,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  const toggleSidebar = () => {
    setCollapsed((previous) => !previous)
  }

  const roleLabel = navigation.title
  const roleShortLabel = roleShortLabels[navigation.role] ?? 'U'

  return (
    <aside
      className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}
      aria-label={`${roleLabel} navigation`}
    >
      <SidebarBrand
        collapsed={collapsed}
        onToggle={toggleSidebar}
      />

      <SidebarNavigation
        navigation={navigation}
        activePath={activePath}
        collapsed={collapsed}
        onNavigate={onNavigate}
      />

      <div className="sidebar__footer">
        <div className="sidebar__avatar" aria-hidden="true">
          {roleShortLabel}
        </div>

        {!collapsed && (
          <div className="sidebar__user">
            <strong>{roleLabel}</strong>
          </div>
        )}
      </div>
    </aside>
  )
}
