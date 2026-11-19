import { describe, expect, it } from 'vitest';
import { makeIssue, makeRecommendation, makeUser } from '../../../test/fixtures';
import { reviewDifferences } from './reviewService';
import { isReviewed } from '../utils/caseReview';
import { whyIssueBlocked } from '../utils/issueRules';

const factor = '3rd delay: Staff shortage';
const users = [makeUser({ id: 'u2', fullName: 'Brian Kiprono' }), makeUser({ id: 'u5', fullName: 'Grace Wanjiru' })];
const review = {
  reviewDate: '2026-11-19',
  finalCause: 'Obstetric haemorrhage',
  maternalCondition: '',
};

describe('case review', () => {
  it('lists every change to the issue and its recommendations for the history', () => {
    const issue = makeIssue({ causeOfDeath: '', contributingFactors: [] });
    const recommendation = makeRecommendation({ responsiblePersonId: 'u2', gap: '' });
    const changes = reviewDifferences({
      issue,
      review,
      contributingFactors: [factor],
      existing: [recommendation],
      edited: [{ ...recommendation, gap: factor, responsiblePersonId: 'u5', removed: false }],
      added: [],
      users,
    });

    expect(changes.map((change) => change.field)).toEqual([
      'Cause of death',
      'Contributing factors',
      `${recommendation.code} gap`,
      `${recommendation.code} responsible person`,
    ]);
    expect(changes[3]).toMatchObject({ from: 'Brian Kiprono', to: 'Grace Wanjiru' });
  });

  it('records a removed recommendation as cancelled', () => {
    const recommendation = makeRecommendation();
    const changes = reviewDifferences({
      issue: makeIssue(),
      review: { ...review, finalCause: '' },
      contributingFactors: [],
      existing: [recommendation],
      edited: [{ ...recommendation, removed: true }],
      added: [],
      users,
    });

    expect(changes).toEqual([{ field: recommendation.code, from: recommendation.text, to: 'Removed (cancelled)' }]);
  });

  it('locks the issue once the review is complete', () => {
    const chair = makeUser({ id: 'u4', role: 'FACILITY_CHAIR' });
    const issue = makeIssue({ review: { ...review, completedAt: '2026-11-19T10:00:00Z', completedById: 'u4' } });

    expect(isReviewed(issue)).toBe(true);
    expect(whyIssueBlocked('edit', issue, chair, [], '2026-11-19')).toMatch(/locked/);
  });
});
