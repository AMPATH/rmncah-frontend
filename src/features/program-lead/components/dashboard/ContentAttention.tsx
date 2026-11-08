import { Button } from '@carbon/react'
import {
  ArrowRight,
  WarningAlt,
  Document,
  CheckmarkFilled,
} from '@carbon/icons-react'

import type { ContentAttentionItem } from '../../types/program-lead.types'

interface ContentAttentionProps {
  items: ContentAttentionItem[]
  onNavigate: (path: string) => void
}

function ContentAttention({
  items,
  onNavigate,
}: ContentAttentionProps) {
  const icons = [
    WarningAlt,
    Document,
    CheckmarkFilled,
  ]

  return (
    <section className="program-panel content-attention">
      <div className="program-panel__header">
        <div>
          <h2>Content requiring attention</h2>
          <p>Complete these activities to prepare training modules for publication.</p>
        </div>
      </div>

      <div className="content-attention__list">
        {items.map((item, index) => {
          const Icon = icons[index % icons.length]

          return (
            <article
              className="content-attention__item"
              key={item.id}
            >
              <div className="content-attention__icon">
                <Icon size={20} />
              </div>

              <div className="content-attention__details">
                <div className="content-attention__title">
                  <h3>{item.title}</h3>
                  <strong>{item.count}</strong>
                </div>

                <p>{item.description}</p>

                <Button
                  kind="ghost"
                  size="sm"
                  renderIcon={ArrowRight}
                  onClick={() => onNavigate(item.path)}
                >
                  {item.actionLabel}
                </Button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default ContentAttention