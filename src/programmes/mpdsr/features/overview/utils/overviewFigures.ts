import type { StoredIssue, StoredRecommendation } from '../../issues/services/issueService';
import type { RecommendationEvent } from '../../recommendations/services/recommendationService';
import { addDays } from '../../../utils/dates';

export type ActionKey = 'pending-acceptance' | 'pending-approval' | 'rejected' | 'escalated' | 'due-soon' | 'overdue';

export interface BarRow {
  label: string;
  count: number;
  colour?: string;
}

export const actionLabels: Record<ActionKey, string> = {
  'pending-acceptance': 'Pending acceptance',
  'pending-approval': 'Pending approval',
  rejected: 'Rejected',
  escalated: 'Escalated',
  'due-soon': 'Due within 7 days',
  overdue: 'Overdue',
};

export const statusColours: Record<string, string> = {
  Open: '#1d4ed8',
  'In progress': '#007d79',
  'Pending acceptance': '#d02670',
  'Pending approval': '#8a3ffc',
  Overdue: '#da1e28',
  Closed: '#198038',
  Cancelled: '#8d8d8d',
};

const statusOrder = ['Pending acceptance', 'Open', 'In progress', 'Pending approval', 'Overdue', 'Closed', 'Cancelled'];
const classificationLabels: Record<string, string> = {
  immediate: 'Immediate',
  intermediate: 'Intermediate',
  'long-term': 'Long term',
};
const issueTypeLabels: Record<string, string> = {
  maternal: 'Maternal',
  perinatal: 'Perinatal',
  'near-miss': 'Near miss',
};
const delayOrder = ['1st', '2nd', '3rd'];
const escalations: RecommendationEvent['action'][] = ['escalated', 'de-escalated', 'auto-escalated'];

const finished = (recommendation: StoredRecommendation) =>
  recommendation.status === 'Closed' || recommendation.status === 'Cancelled';

function lastEventOf(code: string, events: RecommendationEvent[]): RecommendationEvent | undefined {
  const own = events.filter((event) => event.code === code);
  return own[own.length - 1];
}

export function needsAction(
  key: ActionKey,
  recommendation: StoredRecommendation,
  events: RecommendationEvent[],
  today: string
): boolean {
  const last = lastEventOf(recommendation.code, events);
  switch (key) {
    case 'pending-acceptance':
      return recommendation.status === 'Pending acceptance';
    case 'pending-approval':
      return recommendation.status === 'Pending approval';
    case 'rejected':
      return recommendation.status === 'In progress' && last?.action === 'rejected';
    case 'escalated':
      return recommendation.status === 'Pending acceptance' && last !== undefined && escalations.includes(last.action);
    case 'due-soon':
      return (
        !finished(recommendation) &&
        recommendation.status !== 'Overdue' &&
        recommendation.dueDate >= today &&
        recommendation.dueDate <= addDays(today, 7)
      );
    case 'overdue':
      return recommendation.status === 'Overdue';
  }
}

function countBy<T>(items: T[], keyOf: (item: T) => string[], order: string[], labels: Record<string, string> = {}): BarRow[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    for (const key of new Set(keyOf(item))) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const keys = [...counts.keys()].sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    return (ia === -1 ? order.length : ia) - (ib === -1 ? order.length : ib) || a.localeCompare(b);
  });
  return keys.map((key) => ({ label: labels[key] ?? key, count: counts.get(key) ?? 0 }));
}

export function overviewFigures(
  issues: StoredIssue[],
  recommendations: StoredRecommendation[],
  events: RecommendationEvent[],
  today: string
) {
  const closed = recommendations.filter((recommendation) => recommendation.status === 'Closed');
  const closedOnTime = closed.filter((recommendation) => {
    const approvals = events.filter((event) => event.code === recommendation.code && event.action === 'approved');
    const approvedOn = approvals.length > 0 ? approvals[approvals.length - 1].at.slice(0, 10) : '';
    return approvedOn !== '' && approvedOn <= recommendation.dueDate;
  }).length;
  const redone = recommendations.filter((recommendation) => recommendation.timesRedone > 0);

  const actions = (Object.keys(actionLabels) as ActionKey[]).map((key) => ({
    key,
    label: actionLabels[key],
    count: recommendations.filter((recommendation) => needsAction(key, recommendation, events, today)).length,
  }));

  return {
    issuesLogged: issues.length,
    recommendations: recommendations.length,
    overdue: recommendations.filter((recommendation) => recommendation.status === 'Overdue').length,
    closedByDueDate: closed.length === 0 ? '—' : `${Math.round((closedOnTime / closed.length) * 100)}%`,
    closedByDueDateDetail: closed.length === 0 ? 'none closed yet' : `${closedOnTime} of ${closed.length}`,
    redone: redone.length,
    timesRedone: redone.reduce((total, recommendation) => total + recommendation.timesRedone, 0),
    actions,
    byStatus: countBy(recommendations, (recommendation) => [recommendation.status], statusOrder).map((row) => ({
      ...row,
      colour: statusColours[row.label],
    })),
    byClassification: countBy(
      recommendations,
      (recommendation) => [recommendation.classification],
      Object.keys(classificationLabels),
      classificationLabels
    ),
    byType: countBy(issues, (issue) => [issue.issueType], Object.keys(issueTypeLabels), issueTypeLabels),
    byDelay: countBy(
      issues,
      (issue) => (issue.contributingFactors ?? []).map((factor) => factor.split(' delay:')[0]).filter((level) => delayOrder.includes(level)),
      delayOrder,
      { '1st': '1st delay', '2nd': '2nd delay', '3rd': '3rd delay' }
    ),
  };
}
