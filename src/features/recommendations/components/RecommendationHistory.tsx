import '../recommendations.scss';
import { useCurrentUser } from '../../../auth/CurrentUserContext';
import type { StoredRecommendation } from '../../issues/services/issueService';
import { SYSTEM_USER_ID } from '../services/recommendationService';
import type { RecommendationEvent, RecommendationEventAction } from '../services/recommendationService';

const actionLabels: Record<RecommendationEventAction, string> = {
  accepted: 'Accepted',
  escalated: 'Escalated',
  'de-escalated': 'De-escalated',
  'marked-done': 'Marked as done',
  approved: 'Approved and closed',
  rejected: 'Rejected and reopened',
  'marked-overdue': 'Marked overdue',
  reassigned: 'Reassigned',
};

// "2026-11-13T12:20:05Z" → "2026-11-13 15:20" in the user's time zone.
function formatTime(iso: string): string {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

interface RecommendationHistoryProps {
  recommendation: StoredRecommendation;
  events: RecommendationEvent[];
  // Show the "Logged…" first entry (the detail page), or only the actions (close-out trail).
  showLogged?: boolean;
  emptyText?: string;
}

// Every step a recommendation went through, oldest first.
function RecommendationHistory({ recommendation, events, showLogged = true, emptyText }: RecommendationHistoryProps) {
  const { users } = useCurrentUser();
  const nameOf = (id: string) =>
    id === SYSTEM_USER_ID ? 'System' : users.find((user) => user.id === id)?.fullName ?? 'Unknown user';

  if (!showLogged && events.length === 0) {
    return <p className="empty-note">{emptyText}</p>;
  }

  return (
    <ul className="recommendation-history">
      {showLogged && (
        <li>
          <span className="recommendation-history__date">{recommendation.dateLogged}</span>
          Logged with issue {recommendation.issueCode}.
        </li>
      )}
      {events.map((event) => (
        <li key={event.id}>
          <span className="recommendation-history__date">
            {formatTime(event.at)} · {nameOf(event.byUserId)}
          </span>
          {actionLabels[event.action]} ({event.fromStatus} → {event.toStatus})
          {event.note && <span className="recommendation-history__note">{event.note}</span>}
        </li>
      ))}
    </ul>
  );
}

export default RecommendationHistory;
