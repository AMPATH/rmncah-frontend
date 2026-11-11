
import MenteeWelcome from '../components/overview/MenteeWelcome'
import LearningProgress from '../components/overview/LearningProgress'
import UpcomingSessions from '../components/overview/UpcomingSessions'
import AssessmentSummary from '../components/overview/AssessmentSummary'

import { menteeOverviewData } from '../data/menteeOverviewData'

import '../styles/mentee-overview.scss'

interface OverviewPageProps {
  title: string
}

function OverviewPage({ title }: OverviewPageProps) {
  const {
    mentee,
    learning,
    upcomingSessions,
    assessments,
  } = menteeOverviewData

  return (
    <main className="mentee-dashboard">
      <MenteeWelcome
        name={mentee.name}
        role={mentee.role}
        facility={mentee.facility}
        cohort={mentee.cohort}
        competencyStatus={mentee.competencyStatus}
      />

      <section
        className="mentee-dashboard__section"
        aria-labelledby="mentee-overview-heading"
      >
        <div className="mentee-section-heading">
          <div>
            <span className="mentee-section-heading__eyebrow">
              YOUR TRAINING
            </span>

            <h2 id="mentee-overview-heading">{title}</h2>

            <p>
              An overview of your learning activities,
              scheduled sessions and competency assessments.
            </p>
          </div>
        </div>

        <div className="mentee-dashboard__grid">
          <LearningProgress
            planTitle={learning.planTitle}
            modules={learning.modules}
            totalSections={learning.totalSections}
            completedSections={learning.completedSections}
            progress={learning.progress}
          />

          <aside className="mentee-dashboard__side">
            <UpcomingSessions sessions={upcomingSessions} />

            <AssessmentSummary
              total={assessments.total}
              completed={assessments.completed}
              pending={assessments.pending}
              latest={assessments.latest}
            />
          </aside>
        </div>
      </section>

      <footer className="mentee-dashboard__footer">
        <span>EmONC Mentorship Training System</span>
        <span>Mentee workspace</span>
      </footer>
    </main>
  )
}

export default OverviewPage
