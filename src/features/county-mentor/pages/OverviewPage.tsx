import CountyStatistics from '../components/dashboard/CountyStatistics'
import RequiresAttention from '../components/dashboard/RequiresAttention'
import ProgrammePerformance from '../components/dashboard/ProgrammePerformance'
import AssessmentFollowUp from '../components/dashboard/AssessmentFollowUp'
import CohortSubmissions from '../components/dashboard/CohortSubmissions'
import FacilityCoverage from '../components/dashboard/FacilityCoverage'
import RecentActivity from '../components/dashboard/RecentActivity'
import UpcomingActivities from '../components/dashboard/UpcomingActivities'

import { countyMentorDashboardData } from '../data/countyMentorDashboardData'

import { Button } from '@carbon/react'
import { ArrowRight } from '@carbon/icons-react'

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
    <div className="county-overview">
      <header className="county-overview__header">
        <div>
          <span className="county-overview__eyebrow">
            COUNTY MENTOR / RH / MOH
          </span>

          <h1>{title}</h1>

          <p>
            Coordinate mentorship activities, monitor facility
            participation, and review programme progress across
            the county.
          </p>
        </div>

        <div className="county-overview__header-actions">
          <Button
            kind="secondary"
            size="md"
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

      <div className="county-overview__demo-note">
        <span className="county-overview__demo-dot" />

        Demonstration dashboard data — replace with approved
        programme data when backend integration is available.
      </div>

      <section className="county-overview__section">
        <CountyStatistics statistics={statistics} />
      </section>

      <RequiresAttention
        items={attentionItems}
        onNavigate={onNavigate}
      />

      <section className="county-overview__main-grid">
        <ProgrammePerformance performance={performance} />

        <AssessmentFollowUp
          openFindings={openFindings}
          onNavigate={onNavigate}
        />
      </section>

      <CohortSubmissions
        submissions={cohortSubmissions}
        onNavigate={onNavigate}
      />

      <section className="county-overview__lower-grid">
        <FacilityCoverage
          facilities={facilities}
          onNavigate={onNavigate}
        />

        <div className="county-overview__side-column">
          <RecentActivity activities={recentActivities} />

          <UpcomingActivities activities={upcomingActivities} />
        </div>
      </section>

      <section className="county-overview__quick-links">
        <div>
          <h2>County programme management</h2>

          <p>
            Open a workspace to manage county mentorship activities.
          </p>
        </div>

        <div className="county-overview__quick-actions">
          <Button
            kind="secondary"
            size="md"
            onClick={() => onNavigate('/county-mentor/mentors')}
          >
            Manage mentors
          </Button>

          <Button
            kind="secondary"
            size="md"
            onClick={() => onNavigate('/county-mentor/mentees')}
          >
            Manage mentees
          </Button>

          <Button
            kind="secondary"
            size="md"
            onClick={() => onNavigate('/county-mentor/certification')}
          >
            Certification
          </Button>

          <Button
            kind="secondary"
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
    </div>
  )
}

export default OverviewPage