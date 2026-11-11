import type { ReactNode } from 'react';
import './InfoList.scss';

export interface InfoItem {
  label: string;
  value: ReactNode;
}

interface InfoListProps {
  items: InfoItem[];
}

// A list of read-only details the system fills in, shown as "label: value".
function InfoList({ items }: InfoListProps) {
  return (
    <dl className="info-list">
      {items.map((item) => (
        <div className="info-list__row" key={item.label}>
          <dt className="info-list__label">{item.label}</dt>
          <dd className="info-list__value">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default InfoList;
