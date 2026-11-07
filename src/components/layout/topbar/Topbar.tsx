import { Search, Notification } from '@carbon/icons-react'
import './Topbar.scss'

interface TopbarProps {
  pageTitle: string
}

export default function Topbar({ pageTitle }: TopbarProps) {
  return (
    <header className="topbar">
      <div className="topbar__breadcrumb">
        <span>Workspace</span>
        <span>/</span>
        <strong>{pageTitle}</strong>
      </div>

      <div className="topbar__actions">
        <button type="button" aria-label="Search">
          <Search size={20} />
        </button>

        <button type="button" aria-label="Notifications">
          <Notification size={20} />
        </button>

        <div className="topbar__profile">CM</div>
      </div>
    </header>
  )
}