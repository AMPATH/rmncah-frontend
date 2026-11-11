interface ScheduleSummaryProps {
  upcoming: number
  completed: number
  cancelled: number
}

function ScheduleSummary({
  upcoming,
  completed,
  cancelled,
}: ScheduleSummaryProps) {
  const statistics = [
    { label: 'Upcoming sessions', value: upcoming },
    { label: 'Completed sessions', value: completed },
    { label: 'Cancelled sessions', value: cancelled },
  ]

  return (
    <div className="mentee-schedule-summary">
      {statistics.map((statistic) => (
        <div
          className="mentee-schedule-summary__item"
          key={statistic.label}
        >
          <strong>{statistic.value}</strong>
          <span>{statistic.label}</span>
        </div>
      ))}
    </div>
  )
}

export default ScheduleSummary