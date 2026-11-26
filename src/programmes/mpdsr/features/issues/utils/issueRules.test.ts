import { describe, expect, it } from 'vitest';
import { makeIssue, makeRecommendation, makeUser } from '../../../test/fixtures';
import { whyIssueBlocked } from './issueRules';

describe('whyIssueBlocked', () => {
  const logger = makeUser({ id: 'u3', role: 'FACILITY_REPORTER' });
  const otherReporter = makeUser({ id: 'u2', role: 'FACILITY_REPORTER' });
  const chair = makeUser({ id: 'u4', role: 'FACILITY_CHAIR' });
  const issue = makeIssue({ loggedById: 'u3', dateLogged: '2026-11-10' });
  const running = [makeRecommendation({ status: 'In progress' })];

  it('lets the person who logged it edit for 7 days', () => {
    expect(whyIssueBlocked('edit', issue, logger, running, '2026-11-17')).toBe('');
  });

  it('stops the person who logged it after 7 days', () => {
    expect(whyIssueBlocked('edit', issue, logger, running, '2026-11-18')).not.toBe('');
  });

  it('stops other reporters', () => {
    expect(whyIssueBlocked('edit', issue, otherReporter, running, '2026-11-11')).not.toBe('');
  });

  it('lets the chair edit while any recommendation is still running', () => {
    expect(whyIssueBlocked('edit', issue, chair, running, '2026-12-30')).toBe('');
  });

  it('makes the record final once all recommendations are finished', () => {
    const finished = [makeRecommendation({ status: 'Closed' }), makeRecommendation({ status: 'Cancelled' })];
    expect(whyIssueBlocked('edit', issue, chair, finished, '2026-12-30')).not.toBe('');
  });

  it('never lets anyone cancel an issue', () => {
    expect(whyIssueBlocked('cancel', issue, chair, running, '2026-11-11')).not.toBe('');
    expect(whyIssueBlocked('cancel', issue, logger, running, '2026-11-11')).not.toBe('');
  });

  it('blocks everything on a cancelled issue', () => {
    const cancelled = { ...issue, cancelled: true };
    expect(whyIssueBlocked('edit', cancelled, chair, running, '2026-11-11')).not.toBe('');
    expect(whyIssueBlocked('cancel', cancelled, chair, running, '2026-11-11')).not.toBe('');
  });
});
