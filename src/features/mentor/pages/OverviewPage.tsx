import MentorStatistics from '../components/dashboard/MentorStatistics'
import CohortProgress from '../components/dashboard/CohortProgress'
import UpcomingSessions from '../components/dashboard/UpcomingSessions'
import MenteeAttention from '../components/dashboard/MenteeAttention'
import RecentActivity from '../components/dashboard/RecentActivity'

import { mentorDashboardData } from '../data/mentorDashboardData'

import '../styles/mentor-dashboard.scss'

interface OverviewPageProps {
  title: string
}

function OverviewPage({ title }: OverviewPageProps) {
  const {
    statistics,
    cohorts,
    upcomingSessions,
    menteesNeedingAttention,
    recentActivities,
  } = mentorDashboardData

  return (
    <div className="mentor-dashboard">
      <header className="mentor-dashboard__header">
        <div>
          <span className="mentor-dashboard__eyebrow">
            MENTOR WORKSPACE
          </span>

          <h1>{title}</h1>

          <p>
            Manage your cohorts, support your mentees and monitor
            training progress.
          </p>
        </div>

        <div className="mentor-dashboard__welcome">
          <span className="mentor-dashboard__welcome-label">
            YOUR ROLE
          </span>
          <strong>Clinical Mentor</strong>
          <small>Mentorship and competency development</small>
        </div>
      </header>

      <section className="mentor-dashboard__section">
        <div className="mentor-section-heading">
          <h2>At a glance</h2>
          <p>Your current mentorship overview.</p>
        </div>

        <MentorStatistics statistics={statistics} />
      </section>

      <div className="mentor-dashboard__grid">
        <CohortProgress cohorts={cohorts} />

        <UpcomingSessions sessions={upcomingSessions} />
      </div>

      <section className="mentor-dashboard__section">
        <MenteeAttention mentees={menteesNeedingAttention} />
      </section>

      <section className="mentor-dashboard__section">
        <RecentActivity activities={recentActivities} />
      </section>

      <footer className="mentor-dashboard__footer">
        <span>EmONC Mentorship Training System</span>
        <span>Mentor workspace</span>
      </footer>
    </div>
  )
}

export default OverviewPage