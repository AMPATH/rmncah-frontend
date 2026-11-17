import { describe, expect, it } from 'vitest';
import { makeRecommendation, makeUser } from '../../../test/fixtures';
import { whyBlocked } from './recommendationRules';

// Who can act on a recommendation, and when. '' means "allowed".
describe('whyBlocked', () => {
  const holder = makeUser({ id: 'u1', role: 'FACILITY_REPORTER' });
  const someoneElse = makeUser({ id: 'u2', role: 'FACILITY_REPORTER' });
  const chair = makeUser({ id: 'u3', role: 'FACILITY_CHAIR' });
  const pcn = makeUser({ id: 'u4', role: 'PCN_COORDINATOR', level: 'sub-county' });
  const admin = makeUser({ id: 'u5', role: 'SYSTEM_ADMIN', assignedLocations: [] });

  describe('accept', () => {
    const waiting = makeRecommendation({ status: 'Pending acceptance', responsiblePersonId: 'u1' });

    it('lets the person it is assigned to accept it', () => {
      expect(whyBlocked('accept', waiting, holder)).toBe('');
    });

    it('stops anyone else', () => {
      expect(whyBlocked('accept', waiting, someoneElse)).not.toBe('');
      expect(whyBlocked('accept', waiting, admin)).not.toBe('');
    });

    it('stops it once it is no longer waiting for acceptance', () => {
      const started = makeRecommendation({ status: 'In progress', responsiblePersonId: 'u1' });
      expect(whyBlocked('accept', started, holder)).not.toBe('');
    });
  });

  describe('mark as done', () => {
    it.each(['Open', 'In progress', 'Overdue'] as const)('is allowed for the holder when %s', (status) => {
      expect(whyBlocked('markDone', makeRecommendation({ status }), holder)).toBe('');
    });

    it.each(['Pending acceptance', 'Pending approval', 'Closed'] as const)('is not allowed when %s', (status) => {
      expect(whyBlocked('markDone', makeRecommendation({ status }), holder)).not.toBe('');
    });

    it('is not allowed for someone it is not assigned to', () => {
      expect(whyBlocked('markDone', makeRecommendation(), someoneElse)).not.toBe('');
    });
  });

  describe('approve or reject', () => {
    const done = makeRecommendation({ status: 'Pending approval' });

    it('is allowed for the facility MPDSR chair', () => {
      expect(whyBlocked('approve', done, chair)).toBe('');
    });

    it('is not allowed for the person who did the work', () => {
      expect(whyBlocked('approve', done, holder)).not.toBe('');
    });

    it('waits until the work is marked as done', () => {
      expect(whyBlocked('approve', makeRecommendation({ status: 'In progress' }), chair)).not.toBe('');
    });
  });

  describe('reassign', () => {
    it('is allowed for the PCN coordinator when overdue', () => {
      expect(whyBlocked('reassign', makeRecommendation({ status: 'Overdue' }), pcn)).toBe('');
    });

    it('is not allowed before it is overdue', () => {
      expect(whyBlocked('reassign', makeRecommendation({ status: 'In progress' }), pcn)).not.toBe('');
    });

    it('is not allowed for other roles', () => {
      expect(whyBlocked('reassign', makeRecommendation({ status: 'Overdue' }), chair)).not.toBe('');
    });
  });

  it('blocks everything when nobody is chosen', () => {
    expect(whyBlocked('markDone', makeRecommendation(), null)).not.toBe('');
  });
});
