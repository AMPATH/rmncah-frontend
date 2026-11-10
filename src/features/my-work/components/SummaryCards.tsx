import SummaryCard from './SummaryCard';
import './SummaryCards.scss';

const cardTitles = [
  'Pending acceptance',
  'Pending approval',
  'Rejected',
  'Escalated',
  'Due within 7 days',
  'Overdue',
];


function SummaryCards() {
  return (
    <div className="summary-cards">
      {cardTitles.map((title) => (
        <SummaryCard key={title} title={title} count={0} />
      ))}
    </div>
  );
}

export default SummaryCards;
