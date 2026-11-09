import type { ProgrammePerformanceItem } from '../../types/county-mentor.types'

interface ProgrammePerformanceProps {
  performance: ProgrammePerformanceItem[]
}

function ProgrammePerformance({
  performance,
}: ProgrammePerformanceProps) {
  return (
    <section className="county-panel county-performance">
      <div className="county-panel__heading">
        <div>
          <h2>Programme performance</h2>
          <p>Current county-level progress indicators.</p>
        </div>
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