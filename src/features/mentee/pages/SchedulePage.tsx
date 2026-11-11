import ScheduleHeader from '../components/schedule/ScheduleHeader'
import NextSession from '../components/schedule/NextSession'
import ScheduleSummary from '../components/schedule/ScheduleSummary'
import SessionList from '../components/schedule/SessionList'

import { menteeScheduleData } from '../data/menteeScheduleData'

import '../styles/mentee-schedule.scss'

interface SchedulePageProps {
  title: string
}

function getLocalDateKey(): string {
  const now = new Date()

  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function SchedulePage({ title }: SchedulePageProps) {
  const { mentee, planTitle, sessions } = menteeScheduleData

  const today = getLocalDateKey()

  const upcomingSessions = sessions.filter(
    (session) => session.scheduledDate >= today,
  )

  const previousSessions = sessions
    .filter((session) => session.scheduledDate < today)
    .reverse()

  const nextSession =
    upcomingSessions.find(
      (session) =>
        session.status === 'Scheduled' ||
        session.status === 'Rescheduled',
    ) ?? null

  const completedCount = sessions.filter(
    (session) => session.status === 'Completed',
  ).length

  const cancelledCount = sessions.filter(
    (session) => session.status === 'Cancelled',
  ).length

  return (
    <main className="mentee-schedule">
      <ScheduleHeader title={title} mentee={mentee} />

      <section className="mentee-schedule__plan">
        <div className="mentee-schedule__plan-heading">
          <span>YOUR LEARNING PLAN</span>
          <h2>Session schedule</h2>
          <p>{planTitle}</p>
        </div>

        <ScheduleSummary
          upcoming={upcomingSessions.length}
          completed={completedCount}
          cancelled={cancelledCount}
        />
      </section>

      <NextSession session={nextSession} />

      <SessionList
        eyebrow="PLANNED BY YOUR MENTOR"
        title="Upcoming sessions"
        description="Your scheduled teaching, practical learning and coaching activities."
        sessions={upcomingSessions}
        emptyTitle="No upcoming sessions"
        emptyDescription="Your mentor has not scheduled any upcoming sessions for your learning plan."
      />

      <SessionList
        eyebrow="SESSION HISTORY"
        title="Previous sessions"
        description="Review previous session dates and their recorded status."
        sessions={previousSessions}
        emptyTitle="No previous sessions"
        emptyDescription="Your previous mentorship sessions will appear here."
        showStatusNotice
      />

      <footer className="mentee-schedule__footer">
        <span>EmONC Mentorship Training System</span>
        <span>Mentee workspace</span>
      </footer>
    </main>
  )
}

export default SchedulePage