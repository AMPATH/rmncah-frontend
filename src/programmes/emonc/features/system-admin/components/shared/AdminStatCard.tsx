
interface AdminStatCardProps {
  label: string
  value: string | number
  description: string
  icon?: React.ReactNode
}

export default function AdminStatCard({
  label,
  value,
  description,
  icon,
}: AdminStatCardProps) {
  return (
    <article className="admin-stat-card">
      <div className="admin-stat-card__top">
        <span>{label}</span>
        {icon && (
          <span className="admin-stat-card__icon">
            {icon}
          </span>
        )}
      </div>

      <strong className="admin-stat-card__value">
        {value}
      </strong>

      <p>{description}</p>
    </article>
  )
}
