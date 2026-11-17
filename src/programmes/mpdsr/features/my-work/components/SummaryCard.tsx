import { Tile } from '@carbon/react';
import './SummaryCard.scss';

interface SummaryCardProps {
  title: string;
  count: number;
}


function SummaryCard({ title, count }: SummaryCardProps) {
  return (
    <Tile className="summary-card">
      <p className="summary-card__title">{title}</p>
      <p className="summary-card__count">{count}</p>
    </Tile>
  );
}

export default SummaryCard;
