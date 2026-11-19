import { describe, expect, it } from 'vitest';
import { makeEvent, makeIssue, makeRecommendation } from '../../../test/fixtures';
import { needsAction, overviewFigures } from './overviewFigures';

describe('overviewFigures', () => {
  const today = '2026-11-18';
  const issues = [
    makeIssue({ id: 'i1', issueType: 'maternal', contributingFactors: ['1st delay: Poverty', '3rd delay: Lack of staff'] }),
    makeIssue({ id: 'i2', issueType: 'perinatal', contributingFactors: ['1st delay: Long distance', '1st delay: Poverty'] }),
  ];
  const recommendations = [
    makeRecommendation({ code: 'R1', issueId: 'i1', status: 'Overdue', classification: 'immediate' }),
    makeRecommendation({ code: 'R2', issueId: 'i1', status: 'Closed', dueDate: '2026-11-10', timesRedone: 2 }),
    makeRecommendation({ code: 'R3', issueId: 'i2', status: 'In progress', dueDate: '2026-11-20' }),
  ];
  const events = [
    makeEvent({ code: 'R2', action: 'approved', at: '2026-11-09T10:00:00.000Z' }),
    makeEvent({ code: 'R3', action: 'rejected', at: '2026-11-15T10:00:00.000Z' }),
  ];
  const figures = overviewFigures(issues, recommendations, events, today);

  it('counts the key figures', () => {
    expect(figures.issuesLogged).toBe(2);
    expect(figures.recommendations).toBe(3);
    expect(figures.overdue).toBe(1);
    expect(figures.closedByDueDate).toBe('100%');
    expect(figures.redone).toBe(1);
    expect(figures.timesRedone).toBe(2);
  });

  it('counts each delay level once per issue', () => {
    expect(figures.byDelay).toEqual([
      { label: '1st delay', count: 2 },
      { label: '3rd delay', count: 1 },
    ]);
  });

  it('finds rejected work and work due within 7 days', () => {
    expect(needsAction('rejected', recommendations[2], events, today)).toBe(true);
    expect(needsAction('due-soon', recommendations[2], events, today)).toBe(true);
    expect(needsAction('due-soon', recommendations[0], events, today)).toBe(false);
  });

  it('shows a dash when nothing is closed yet', () => {
    expect(overviewFigures([], [], [], today).closedByDueDate).toBe('—');
  });
});
