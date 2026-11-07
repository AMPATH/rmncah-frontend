
import type { RoleNavigation } from '../../../config/navigation/navigation.types'
import SidebarNavItem from './SidebarNavItem'

interface SidebarNavigationProps {
  navigation: RoleNavigation
  activePath: string
  collapsed: boolean
  onNavigate: (path: string) => void
}

export default function SidebarNavigation({
  navigation,
  activePath,
  collapsed,
  onNavigate,
}: SidebarNavigationProps) {
  return (
    <nav className="sidebar__navigation" aria-label="Role navigation">
      {navigation.groups.map((group, groupIndex) => (
        <div
          className="sidebar__group"
          key={`${group.label ?? 'group'}-${groupIndex}`}
        >
          {group.label && !collapsed && (
            <p className="sidebar__group-label">{group.label}</p>
          )}

          {group.items.map((item) => (
            <SidebarNavItem
              key={item.path}
              label={item.label}
              path={item.path}
              icon={item.icon}
              active={activePath === item.path}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ))}
    </nav>
  )
}
