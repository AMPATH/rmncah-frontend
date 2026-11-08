import ProgramStatistics from '../components/dashboard/ProgramStatistics'
import ModuleStatusOverview from '../components/dashboard/ModuleStatusOverview'
import RecentModules from '../components/dashboard/RecentModules'
import RecentActivity from '../components/dashboard/RecentActivity'
import ContentAttention from '../components/dashboard/ContentAttention'

import {
  programDashboardStatistics,
  programModules,
  programActivities,
  contentAttentionItems,
} from '../data/programLeadDashboardData'

import '../styles/program-lead-dashboard.scss'

interface OverviewPageProps {
  title: string
  onNavigate?: (path: string) => void
}

function OverviewPage({
  title,
  onNavigate,
}: OverviewPageProps) {
  function handleNavigate(path: string) {
    onNavigate?.(path)
  }

  return (
    <div className="program-dashboard">
      <header className="program-dashboard__header">
        <div>
          <span className="program-dashboard__eyebrow">
            PROGRAM MANAGEMENT
          </span>

          <h1>{title}</h1>

          <p>
            Manage EmONC training modules, learning content and
            publication to the Module Library.
          </p>
        </div>
      </header>

      <ProgramStatistics
        statistics={programDashboardStatistics}
      />

      <div className="program-dashboard__main-grid">
        <ModuleStatusOverview
          statistics={programDashboardStatistics}
        />

        <ContentAttention
          items={contentAttentionItems}
          onNavigate={handleNavigate}
        />
      </div>

      <div className="program-dashboard__content-grid">
        <RecentModules
          modules={programModules}
          onViewAll={() =>
            handleNavigate('/program-lead/training-modules')
          }
        />

        <RecentActivity
          activities={programActivities}
        />
      </div>

      <p className="program-dashboard__demo-notice">
        Demonstration data is displayed. Live program information
        will appear when backend services are integrated.
      </p>
    </div>
  )
}

export default OverviewPage
