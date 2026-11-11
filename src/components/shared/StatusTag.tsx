import { Tag } from '@carbon/react';
import type { RecommendationStatus } from '../../features/issues/types/issue.types';

// One colour per status, used everywhere a status is shown.
const statusColours: Record<RecommendationStatus, 'blue' | 'teal' | 'magenta' | 'purple' | 'red' | 'gray'> = {
  Open: 'blue',
  'In progress': 'teal',
  'Pending acceptance': 'magenta',
  'Pending approval': 'purple',
  Overdue: 'red',
  Closed: 'gray',
};

interface StatusTagProps {
  status: RecommendationStatus;
}

function StatusTag({ status }: StatusTagProps) {
  return <Tag type={statusColours[status]}>{status}</Tag>;
}

export default StatusTag;
