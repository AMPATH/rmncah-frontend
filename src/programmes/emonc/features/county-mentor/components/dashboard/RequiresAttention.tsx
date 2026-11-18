import {
  ArrowRight,
  WarningAlt,
  Information,
  CheckmarkFilled,
  Document,
} from '@carbon/icons-react'
import { Button } from '@carbon/react'

import type { CountyAttentionItem } from '../../types/county-mentor.types.ts'

interface RequiresAttentionProps {
  items: CountyAttentionItem[]
  onNavigate: (path: string) => void
}

const attentionIcons = {
  warning: WarningAlt,
  danger: WarningAlt,
  info: Information,
  success: CheckmarkFilled,
}

function RequiresAttention({ items, onNavigate }: RequiresAttentionProps) {
  return (
    <section className="county-overview__attention">
      <div className="county-section-heading">
        <div>
          <span className="county-section-heading__eyebrow">ACTION QUEUE</span>
          <h2>Requires attention</h2>
          <p>Items that need review, action, or county-level follow-up.</p>
        </div>

        <span className="county-section-heading__count">
          {items.reduce((total, item) => total + item.count, 0)} items
        </span>
      </div>

      <div className="county-attention-grid">
        {items.map((item) => {
          const Icon = attentionIcons[item.tone] ?? Document

          return (
            <article
              className={`county-attention-card county-attention-card--${item.tone}`}
              key={item.id}
            >
              <div className="county-attention-card__top">
                <span className="county-attention-card__icon">
                  <Icon size={19} />
                </span>
                <strong>{item.count}</strong>
              </div>

              <div className="county-attention-card__content">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>

              <Button
                kind="ghost"
                size="sm"
                renderIcon={ArrowRight}
                onClick={() => onNavigate(item.path)}
              >
                {item.action}
              </Button>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default RequiresAttention
