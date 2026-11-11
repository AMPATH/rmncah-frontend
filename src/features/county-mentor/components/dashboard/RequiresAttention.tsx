import { Button } from '@carbon/react'
import { ArrowRight } from '@carbon/icons-react'

import type { CountyAttentionItem } from '../../types/county-mentor.types'

interface RequiresAttentionProps {
  items: CountyAttentionItem[]
  onNavigate: (path: string) => void
}

function RequiresAttention({
  items,
  onNavigate,
}: RequiresAttentionProps) {
  return (
    <section className="county-overview__section">
      <div className="county-section-heading">
        <div>
          <h2>Requires attention</h2>
          <p>
            Items that may require county-level review or follow-up.
          </p>
        </div>
      </div>

      <div className="county-attention-grid">
        {items.map((item) => (
          <article
            className={`county-attention-card county-attention-card--${item.tone}`}
            key={item.id}
          >
            <div className="county-attention-card__top">
              <span>{item.title}</span>
              <strong>{item.count}</strong>
            </div>

            <p>{item.description}</p>

            <Button
              kind="tertiary"
              size="sm"
              renderIcon={ArrowRight}
              onClick={() => onNavigate(item.path)}
            >
              {item.action}
            </Button>
          </article>
        ))}
      </div>
    </section>
  )
}

export default RequiresAttention