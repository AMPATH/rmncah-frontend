
import type { ReactNode } from 'react'

interface SidebarNavItemProps {
  label: string
  path: string
  icon: ReactNode
  active: boolean
  collapsed: boolean
  onNavigate: (path: string) => void
}

export default function SidebarNavItem({
  label,
  path,
  icon,
  active,
  collapsed,
  onNavigate,
}: SidebarNavItemProps) {
  return (
    <button
      type="button"
      className={`sidebar__item ${active ? 'sidebar__item--active' : ''}`}
      onClick={() => onNavigate(path)}
      title={collapsed ? label : undefined}
      aria-label={collapsed ? label : undefined}
      aria-current={active ? 'page' : undefined}
    >
      <span className="sidebar__item-icon" aria-hidden="true">
        {icon}
      </span>

      {!collapsed && (
        <span className="sidebar__item-label">
          {label}
        </span>
      )}
    </button>
  )
}
