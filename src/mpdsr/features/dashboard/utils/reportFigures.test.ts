import { describe, expect, it } from 'vitest';
import { makeEvent, makeIssue, makeRecommendation } from '../../../test/fixtures';
import type { Location } from '../../../auth/locations';
import { figuresByPlace, filterRecords, performanceFigures } from './reportFigures';

const locations: Location[] = [
  { id: 'l1', name: 'Uasin Gishu County', type: 'county', parent: '' },
  { id: 'l2', name: 'Kapseret Sub-county', type: 'sub-county', parent: 'Uasin Gishu County' },
  { id: 'l3', name: 'Huruma Sub-County Hospital', type: 'facility', parent: 'Kapseret Sub-county' },
  { id: 'l4', name: 'Langas Community Unit', type: 'community-unit', parent: 'Huruma Sub-County Hospital' },
  { id: 'l5', name: 'Moiben Sub-county', type: 'sub-county', parent: 'Uasin Gishu County' },
];

const noFilters = { county: '', subCounty: '', facility: '', issueType: '', setting: '', period: '' };

describe('filterRecords', () => {
  const atHuruma = makeIssue({ id: 'i1', loggedAt: 'Huruma Sub-County Hospital', issueType: 'maternal' });
  const atLangas = makeIssue({ id: 'i2', loggedAt: 'Langas Community Unit', issueType: 'perinatal' });
  const atMoiben = makeIssue({ id: 'i3', loggedAt: 'Moiben Sub-county', issueType: 'maternal' });
  const issues = [atHuruma, atLangas, atMoiben];
  const recommendations = [
    makeRecommendation({ code: 'R-1', issueId: 'i1' }),
    makeRecommendation({ code: 'R-2', issueId: 'i2' }),
    makeRecommendation({ code: 'R-3', issueId: 'i3' }),
  ];

  it('keeps a place and everything under it', () => {
    const { shownIssues } = filterRecords(issues, recommendations, { ...noFilters, subCounty: 'Kapseret Sub-county' }, '2026-11-16', locations);
    expect(shownIssues.map((issue) => issue.id)).toEqual(['i1', 'i2']);
  });

  it('keeps only the recommendations of the issues shown', () => {
    const { shownRecommendations } = filterRecords(issues, recommendations, { ...noFilters, issueType: 'maternal' }, '2026-11-16', locations);
    expect(shownRecommendations.map((recommendation) => recommendation.code)).toEqual(['R-1', 'R-3']);
  });
});

describe('performanceFigures', () => {
  it('averages the days from waiting to accepted', () => {
    const recommendations = [
      makeRecommendation({ code: 'A', dateLogged: '2026-11-01' }),
      makeRecommendation({ code: 'B', dateLogged: '2026-11-01' }),
    ];
    const events = [
      makeEvent({ code: 'A', action: 'accepted', at: '2026-11-02T08:00:00.000Z' }), // 1 day
      makeEvent({ code: 'B', action: 'accepted', at: '2026-11-04T08:00:00.000Z' }), // 3 days
    ];

    expect(performanceFigures(recommendations, events).averageWait).toBe('2.0 days (2 accepted)');
  });

  it('counts the wait from a reassignment, not from when it was logged', () => {
    const recommendations = [makeRecommendation({ code: 'A', dateLogged: '2026-11-01' })];
    const events = [
      makeEvent({ code: 'A', action: 'reassigned', at: '2026-11-10T08:00:00.000Z' }),
      makeEvent({ code: 'A', action: 'accepted', at: '2026-11-11T08:00:00.000Z' }),
    ];

    expect(performanceFigures(recommendations, events).averageWait).toBe('1.0 days (1 accepted)');
  });

  it('counts closed work approved by its due date', () => {
    const recommendations = [
      makeRecommendation({ code: 'A', status: 'Closed', dueDate: '2026-11-10' }),
      makeRecommendation({ code: 'B', status: 'Closed', dueDate: '2026-11-10' }),
      makeRecommendation({ code: 'C', status: 'In progress', dueDate: '2026-11-10' }),
    ];
    const events = [
      makeEvent({ code: 'A', action: 'approved', at: '2026-11-09T08:00:00.000Z' }), // on time
      makeEvent({ code: 'B', action: 'approved', at: '2026-11-12T08:00:00.000Z' }), // late
    ];

    expect(performanceFigures(recommendations, events).completedOnTime).toBe('1 of 2 (50%)');
  });

  it('counts each recommendation once, however often it was rejected or escalated', () => {
    const recommendations = [makeRecommendation({ code: 'A' }), makeRecommendation({ code: 'B' })];
    const events = [
      makeEvent({ code: 'A', action: 'rejected' }),
      makeEvent({ code: 'A', action: 'rejected' }),
      makeEvent({ code: 'B', action: 'escalated' }),
      makeEvent({ code: 'B', action: 'de-escalated' }),
    ];

    const figures = performanceFigures(recommendations, events);
    expect(figures.rejected).toBe(1);
    expect(figures.escalated).toBe(1);
  });

  it('ignores the history of recommendations outside the filters', () => {
    const events = [makeEvent({ code: 'NOT-SHOWN', action: 'rejected' })];
    expect(performanceFigures([makeRecommendation({ code: 'A' })], events).rejected).toBe(0);
  });

  it('shows a dash when there is nothing to measure yet', () => {
    const figures = performanceFigures([], []);
    expect(figures.averageWait).toBe('—');
    expect(figures.completedOnTime).toBe('—');
    expect(figures.redone).toBe('None');
  });
});

describe('figuresByPlace', () => {
  it('counts issues and recommendation statuses for each place', () => {
    const issues = [makeIssue({ id: 'i1', loggedAt: 'Huruma Sub-County Hospital' })];
    const recommendations = [
      makeRecommendation({ code: 'A', issueId: 'i1', status: 'Open' }),
      makeRecommendation({ code: 'B', issueId: 'i1', status: 'Overdue' }),
      makeRecommendation({ code: 'C', issueId: 'i1', status: 'Closed' }),
    ];

    expect(figuresByPlace(issues, recommendations)).toEqual([
      {
        id: 'Huruma Sub-County Hospital',
        place: 'Huruma Sub-County Hospital',
        issues: 1,
        recommendations: 3,
        running: 1,
        overdue: 1,
        closed: 1,
      },
    ]);
  });
});
