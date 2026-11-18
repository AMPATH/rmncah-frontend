import {
  ArrowRight,

  Document,
  UserMultiple,
} from '@carbon/icons-react'
import { Button } from '@carbon/react'

import CountyStatistics from '../components/dashboard/CountyStatistics'
import RequiresAttention from '../components/dashboard/RequiresAttention'
import ProgrammePerformance from '../components/dashboard/ProgrammePerformance'
import AssessmentFollowUp from '../components/dashboard/AssessmentFollowUp'
import CohortSubmissions from '../components/dashboard/CohortSubmissions'
import FacilityCoverage from '../components/dashboard/FacilityCoverage'
import RecentActivity from '../components/dashboard/RecentActivity'
import UpcomingActivities from '../components/dashboard/UpcomingActivities'

import { countyMentorDashboardData } from '../data/countyMentorDashboardData'
import '../styles/county-mentor-dashboard.scss'

interface OverviewPageProps {
  title: string
  onNavigate: (path: string) => void
}

function OverviewPage({ title, onNavigate }: OverviewPageProps) {
  const {
    statistics,
    attentionItems,
    performance,
    openFindings,
    cohortSubmissions,
    facilities,
    recentActivities,
    upcomingActivities,
  } = countyMentorDashboardData

  return (
    <main className="county-overview">
      <header className="county-overview__header">
        <div className="county-overview__intro">
          <div className="county-overview__eyebrow">
            <span className="county-overview__eyebrow-dot" />
            COUNTY MENTOR WORKSPACE
          </div>

          <h1>{title}</h1>

          <p>
            Your county programme at a glance. Monitor mentorship,
            follow up on facilities, and keep programme activities moving.
          </p>
        </div>

        <div className="county-overview__header-actions">
          <Button
            kind="secondary"
            size="md"
            renderIcon={Document}
            onClick={() => onNavigate('/county-mentor/reports')}
          >
            View reports
          </Button>

          <Button
            kind="primary"
            size="md"
            renderIcon={ArrowRight}
            onClick={() => onNavigate('/county-mentor/site-assessments')}
          >
            Site assessments
          </Button>
        </div>
      </header>


      <CountyStatistics statistics={statistics} />

      <RequiresAttention
        items={attentionItems}
        onNavigate={onNavigate}
      />

      <div className="county-overview__primary-grid">
        <ProgrammePerformance performance={performance} />

        <AssessmentFollowUp
          openFindings={openFindings}
          onNavigate={onNavigate}
        />
      </div>

      <CohortSubmissions
        submissions={cohortSubmissions}
        onNavigate={onNavigate}
      />

      <div className="county-overview__secondary-grid">
        <FacilityCoverage
          facilities={facilities}
          onNavigate={onNavigate}
        />

        <div className="county-overview__activity-column">
          <RecentActivity activities={recentActivities} />
          <UpcomingActivities activities={upcomingActivities} />
        </div>
      </div>

      <section className="county-overview__management">
        <div className="county-overview__management-copy">
          <span className="county-overview__management-icon">
            <UserMultiple size={20} />
          </span>
          <div>
            <h2>County programme management</h2>
            <p>Go directly to the areas you coordinate and manage.</p>
          </div>
        </div>

        <div className="county-overview__management-actions">
          <Button
            kind="tertiary"
            size="md"
            onClick={() => onNavigate('/county-mentor/mentors')}
          >
            Manage mentors
          </Button>
          <Button
            kind="tertiary"
            size="md"
            onClick={() => onNavigate('/county-mentor/mentees')}
          >
            Manage mentees
          </Button>
          <Button
            kind="tertiary"
            size="md"
            onClick={() => onNavigate('/county-mentor/certification')}
          >
            Certification
          </Button>
          <Button
            kind="tertiary"
            size="md"
            onClick={() => onNavigate('/county-mentor/reports')}
          >
            Reports
          </Button>
        </div>
      </section>

      <footer className="county-overview__footer">
        <span>EmONC Mentorship Training System</span>
        <span>County Mentor workspace</span>
      </footer>
    </main>
  )
}

export default OverviewPage
