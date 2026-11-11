interface ScheduleHeaderProps {
  title: string
  mentee: {
    name: string
    facility: string
    cohort: string
  }
}

function ScheduleHeader({ title, mentee }: ScheduleHeaderProps) {
  const initials = mentee.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="mentee-schedule-header">
      <div className="mentee-schedule-header__content">
        <span className="mentee-schedule-header__eyebrow">
          MENTORSHIP ACTIVITIES
        </span>

        <h1>{title}</h1>

        <p>
          View the teaching sessions, practical activities and coaching
          arranged by your assigned mentor.
        </p>
      </div>

      <div className="mentee-schedule-header__profile">
        <div className="mentee-schedule-header__avatar">
          {initials}
        </div>

        <div className="mentee-schedule-header__identity">
          <strong>{mentee.name}</strong>
          <span>{mentee.facility}</span>
          <span>{mentee.cohort}</span>
        </div>
      </div>
    </header>
  )
}

export default ScheduleHeader