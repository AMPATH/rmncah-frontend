import { SkeletonPlaceholder } from '@carbon/react';
import './LoadingCards.scss';

interface LoadingCardsProps {
  count: number;
}

// Grey boxes in place of the summary cards while their numbers load.
function LoadingCards({ count }: LoadingCardsProps) {
  return (
    <div className="loading-cards" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonPlaceholder key={index} className="loading-cards__card" />
      ))}
    </div>
  );
}

export default LoadingCards;
