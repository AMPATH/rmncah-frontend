import type { BarRow } from '../utils/overviewFigures';

interface BarListProps {
  title: string;
  rows: BarRow[];
}

function BarList({ title, rows }: BarListProps) {
  const largest = Math.max(1, ...rows.map((row) => row.count));
  return (
    <div className="bar-list">
      <h3 className="bar-list__title">{title}</h3>
      {rows.length === 0 ? (
        <p className="bar-list__empty">Nothing yet</p>
      ) : (
        <ul className="bar-list__rows">
          {rows.map((row) => (
            <li key={row.label} className="bar-list__row">
              <span className="bar-list__label">{row.label}</span>
              <span className="bar-list__track" aria-hidden="true">
                <span
                  className="bar-list__fill"
                  style={{ width: `${(row.count / largest) * 100}%`, background: row.colour }}
                />
              </span>
              <span className="bar-list__count">{row.count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default BarList;
