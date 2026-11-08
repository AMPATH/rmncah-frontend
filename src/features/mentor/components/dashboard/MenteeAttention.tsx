import type { MenteeAttentionItem } from '../../types/mentor.types'

interface MenteeAttentionProps {
  mentees: MenteeAttentionItem[]
}

function MenteeAttention({ mentees }: MenteeAttentionProps) {
  return (
    <section className="mentor-panel mentor-attention">
      <div className="mentor-panel__heading">
        <div>
          <h2>Mentees requiring attention</h2>
          <p>Follow-up, coaching and reassessment needs.</p>
        </div>

        <span className="mentor-panel__count">
          {mentees.length} mentees
        </span>
      </div>

      {mentees.length === 0 ? (
        <div className="mentor-empty">
          No mentees currently require follow-up.
        </div>
      ) : (
        <div className="mentor-attention-list">
          {mentees.map((mentee) => (
            <article
              className="mentor-attention-item"
              key={mentee.id}
            >
              <div className="mentor-attention-item__main">
                <div className="mentor-avatar">
                  {mentee.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h3>{mentee.name}</h3>
                  <p>
                    {mentee.cohort} · {mentee.facility}
                  </p>
                  <span>{mentee.issue}</span>
                </div>
              </div>

              <div className="mentor-attention-item__status">
                <span
                  className={`mentor-priority mentor-priority--${mentee.priority.toLowerCase()}`}
                >
                  {mentee.priority} priority
                </span>

                <small>{mentee.lastActivity}</small>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default MenteeAttention