import SummaryCard from './SummaryCard';
import './SummaryCards.scss';

export interface CardFigure {
  title: string;
  count: number;
}

interface SummaryCardsProps {
  cards: CardFigure[];
}

function SummaryCards({ cards }: SummaryCardsProps) {
  return (
    <div className="summary-cards">
      {cards.map((card) => (
        <SummaryCard key={card.title} title={card.title} count={card.count} />
      ))}
    </div>
  );
}

export default SummaryCards;
