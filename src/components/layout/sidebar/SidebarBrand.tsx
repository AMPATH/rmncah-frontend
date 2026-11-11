
import { ChevronLeft, ChevronRight } from '@carbon/icons-react'

interface SidebarBrandProps {
  collapsed: boolean
  mobileOpen: boolean
  onToggle: () => void
  onMobileClose: () => void
}

export default function SidebarBrand({
  collapsed,
  mobileOpen,
  onToggle,
  onMobileClose,
}: SidebarBrandProps) {
  return (
    <div className={`sidebar__brand ${collapsed ? 'sidebar__brand--collapsed' : ''}`}>
      {!collapsed && (
        <div className="sidebar__brand-text">
          <h1>EmONC</h1>
          <span>MENTORSHIP SYSTEM</span>
        </div>
      )}

      <button
        className="sidebar__brand-toggle"
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-expanded={!collapsed}
      >
        {collapsed ? (
          <ChevronRight size={20} />
        ) : (
          <ChevronLeft size={20} />
        )}
      </button>

      {mobileOpen && (
        <button
          className="sidebar__mobile-close"
          type="button"
          onClick={onMobileClose}
          aria-label="Close navigation menu"
        >
          <span aria-hidden="true">×</span>
        </button>
      )}
    </div>
  )
}
