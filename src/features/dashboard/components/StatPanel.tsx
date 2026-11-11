import { Tile } from '@carbon/react';
import type { StatRow } from '../types/dashboard.types';
import './StatPanel.scss';

interface StatPanelProps {
  title: string;
  rows: StatRow[];
  note?: string;
}

// One dashboard panel: a title and a list of figures.
function StatPanel({ title, rows, note }: StatPanelProps) {
  return (
    <Tile className="stat-panel">
      <h2 className="stat-panel__title">{title}</h2>
      <dl className="stat-panel__rows">
        {rows.map((row) => (
          <div className="stat-panel__row" key={row.label}>
            <dt>{row.label}</dt>
            <dd className="stat-panel__value">{row.value}</dd>
          </div>
        ))}
      </dl>
      {note && <p className="stat-panel__note">{note}</p>}
    </Tile>
  );
}

export default StatPanel;
