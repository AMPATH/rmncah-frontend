import type { Period, TrackedType } from '../utils/trackerFigures';
import './Tracker.scss';

interface TrackerRowProps {
  title: string;
  type: TrackedType;
  cells: { period: Period; count: number }[];
}

function TrackerRow({ title, type, cells }: TrackerRowProps) {
  return (
    <section className={`tracker tracker--${type}`} aria-label={`${title} tracker`}>
      <h2 className="tracker__title">{title} — tracker</h2>
      <div className="tracker__cards">
        {cells.map(({ period, count }) => (
          <div
            key={period.key}
            className={`tracker__card${period.key === 'this-week' ? ' tracker__card--current' : ''}`}
          >
            <p className="tracker__label">{period.label}</p>
            <p className="tracker__count">{count}</p>
            <p className="tracker__detail">{period.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TrackerRow;