
interface AdminPageHeaderProps {
  title: string
  description: string
  eyebrow?: string
  action?: React.ReactNode
}

export default function AdminPageHeader({
  title,
  description,
  eyebrow = 'ADMINISTRATION',
  action,
}: AdminPageHeaderProps) {
  return (
    <header className="admin-page-header">
      <div className="admin-page-header__content">
        <span className="admin-page-header__eyebrow">
          {eyebrow}
        </span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      {action && (
        <div className="admin-page-header__action">
          {action}
        </div>
      )}
    </header>
  )
}
