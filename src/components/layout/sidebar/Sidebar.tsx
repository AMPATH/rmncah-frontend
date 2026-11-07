
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

export default function Sidebar({
  navigation,
  activePath,
  onNavigate,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  const toggleSidebar = () => {
    setCollapsed((previous) => !previous)
  }

  return (
    <aside
      className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}
      aria-label="Main navigation"
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
          CM
        </div>

        {!collapsed && (
          <div className="sidebar__user">
            <strong>County Mentor</strong>
          </div>
        )}
      </div>
    </aside>
  )
}
