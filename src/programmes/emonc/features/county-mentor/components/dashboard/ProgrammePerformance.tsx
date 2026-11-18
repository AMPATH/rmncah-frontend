import { ChartLine } from '@carbon/icons-react'

import type { ProgrammePerformanceItem } from '../../types/county-mentor.types.ts'

interface ProgrammePerformanceProps {
  performance: ProgrammePerformanceItem[]
}

function ProgrammePerformance({ performance }: ProgrammePerformanceProps) {
  return (
    <section className="county-panel county-performance">
      <div className="county-panel__heading">
        <div>
          <span className="county-panel__eyebrow">PROGRAMME INDICATORS</span>
          <h2>Programme performance</h2>
          <p>Progress across key county mentorship indicators.</p>
        </div>
        <span className="county-panel__heading-icon">
          <ChartLine size={20} />
        </span>
      </div>

      <div className="county-performance__items">
        {performance.map((item) => {
          const progress = Math.min(100, Math.max(0, item.value))

          return (
            <div className="county-performance__item" key={item.id}>
              <div className="county-performance__label">
                <strong>{item.label}</strong>
                <span>{item.value}%</span>
              </div>

              <div
                className="county-performance__track"
                role="progressbar"
                aria-label={item.label}
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="county-performance__fill"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p>{item.detail}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default ProgrammePerformance
