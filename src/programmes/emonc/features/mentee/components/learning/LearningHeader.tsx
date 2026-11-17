
interface LearningHeaderProps {
  title: string
  planTitle: string
  cohort: string
}

function LearningHeader({
  title,
  planTitle,
  cohort,
}: LearningHeaderProps) {
  return (
    <header className="mentee-learning-header">
      <div className="mentee-learning-header__main">
        <span className="mentee-learning-header__eyebrow">
          MENTEE WORKSPACE
        </span>

        <h1>{title}</h1>

        <p>
          Access your assigned training modules and continue
          your learning journey.
        </p>
      </div>

      <div className="mentee-learning-header__context">
        <span>{cohort}</span>
        <strong>{planTitle}</strong>
      </div>
    </header>
  )
}

export default LearningHeader
