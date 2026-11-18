import { SkeletonText, Tile } from '@carbon/react';
import type { StatRow } from '../types/dashboard.types';
import './StatPanel.scss';

interface StatPanelProps {
  title: string;
  rows: StatRow[];
  note?: string;
  loading?: boolean;
}

function StatPanel({ title, rows, note, loading = false }: StatPanelProps) {
  return (
    <Tile className="stat-panel">
      <h2 className="stat-panel__title">{title}</h2>
      {loading ? (
        <SkeletonText paragraph lineCount={rows.length} />
      ) : (
        <dl className="stat-panel__rows">
          {rows.map((row) => (
            <div className="stat-panel__row" key={row.label}>
              <dt>{row.label}</dt>
              <dd className="stat-panel__value">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {note && <p className="stat-panel__note">{note}</p>}
    </Tile>
  );
}

export default StatPanel;
