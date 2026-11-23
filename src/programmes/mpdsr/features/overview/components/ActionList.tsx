import { Button } from '@carbon/react';
import { ArrowRight } from '@carbon/icons-react';
import type { ActionKey } from '../utils/overviewFigures';

interface ActionRow {
  key: ActionKey;
  label: string;
  count: number;
}

interface ActionListProps {
  rows: ActionRow[];
  selected: ActionKey | '';
  onOpen: (key: ActionKey) => void;
}

function badgeClass(row: ActionRow) {
  if (row.count === 0) return 'action-list__badge';
  return row.key === 'overdue' ? 'action-list__badge action-list__badge--overdue' : 'action-list__badge action-list__badge--due';
}

function ActionList({ rows, selected, onOpen }: ActionListProps) {
  return (
    <ul className="action-list">
      {rows.map((row) => (
        <li key={row.key} className={row.key === selected ? 'action-list__row action-list__row--selected' : 'action-list__row'}>
          <span className="action-list__label">{row.label}</span>
          <span className={badgeClass(row)}>{row.count}</span>
          <span className="action-list__open">
            {row.count > 0 && (
              <Button kind="ghost" size="sm" renderIcon={ArrowRight} onClick={() => onOpen(row.key)}>
                View
              </Button>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default ActionList;