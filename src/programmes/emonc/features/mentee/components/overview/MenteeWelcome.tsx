
interface MenteeWelcomeProps {
  name: string
  role: string
  facility: string
  cohort: string
  competencyStatus: string
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function MenteeWelcome({
  name,
  role,
  facility,
  cohort,
  competencyStatus,
}: MenteeWelcomeProps) {
  const firstName = name.trim().split(/\s+/)[0]

  return (
    <header className="mentee-welcome">
      <div className="mentee-welcome__content">
        <span className="mentee-welcome__eyebrow">
          MENTEE WORKSPACE
        </span>

        <h1>Welcome back, {firstName}</h1>

        <p>
          Your learning and mentorship activities, brought together
          in one place. Review your progress and stay up to date
          with your training.
        </p>
      </div>

      <div className="mentee-welcome__profile">
        <div
          className="mentee-welcome__avatar"
          aria-hidden="true"
        >
          {getInitials(name)}
        </div>

        <div className="mentee-welcome__details">
          <strong>{name}</strong>
          <span>{role}</span>
          <small>{facility}</small>
          <small>{cohort}</small>

          <span className="mentee-welcome__status">
            {competencyStatus}
          </span>
        </div>
      </div>
    </header>
  )
}

export default MenteeWelcome
