import SummaryCard from './SummaryCard';
import './SummaryCards.scss';

export interface CardFigure {
  title: string;
  count: number;
}

interface SummaryCardsProps {
  cards: CardFigure[];
}

// The count cards at the top of the Overview. Each role gets its own set.
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
