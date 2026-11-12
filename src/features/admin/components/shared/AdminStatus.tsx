
interface AdminStatusProps {
  value: string
}

export default function AdminStatus({
  value,
}: AdminStatusProps) {
  const normalized = value.toLowerCase().replace(/\s+/g, '-')

  const supportedStatuses = [
    'active',
    'published',
    'successful',
    'pending',
    'draft',
    'inactive',
    'suspended',
    'archived',
    'failed',
  ]

  const status = supportedStatuses.includes(normalized)
    ? normalized
    : 'neutral'

  return (
    <span className={`admin-status admin-status--${status}`}>
      <span className="admin-status__dot" />
      {value}
    </span>
  )
}
