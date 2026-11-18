import { describe, expect, it } from 'vitest';
import { makeRecommendation, makeUser } from '../../../test/fixtures';
import { whyBlocked } from './recommendationRules';

describe('edit and cancel rules', () => {
  const reporter = makeUser({ id: 'u3', role: 'FACILITY_REPORTER' });
  const chair = makeUser({ id: 'u4', role: 'FACILITY_CHAIR' });
  const county = makeUser({ id: 'u7', role: 'COUNTY_SURVEILLANCE_LEAD', level: 'county' });

  it.each(['Open', 'Pending acceptance'] as const)('allows editing while %s', (status) => {
    expect(whyBlocked('edit', makeRecommendation({ status }), reporter)).toBe('');
  });

  it.each(['In progress', 'Pending approval', 'Overdue', 'Closed', 'Cancelled'] as const)(
    'stops editing once work has started or ended (%s)',
    (status) => {
      expect(whyBlocked('edit', makeRecommendation({ status }), reporter)).not.toBe('');
    }
  );

  it('stops roles that do not add recommendations from editing', () => {
    expect(whyBlocked('edit', makeRecommendation(), county)).not.toBe('');
  });

  it('lets the facility MPDSR chair cancel anything not finished', () => {
    expect(whyBlocked('cancel', makeRecommendation({ status: 'In progress' }), chair)).toBe('');
    expect(whyBlocked('cancel', makeRecommendation({ status: 'Overdue' }), chair)).toBe('');
  });

  it('stops others from cancelling', () => {
    expect(whyBlocked('cancel', makeRecommendation(), reporter)).not.toBe('');
  });

  it('cannot cancel what is already closed or cancelled', () => {
    expect(whyBlocked('cancel', makeRecommendation({ status: 'Closed' }), chair)).not.toBe('');
    expect(whyBlocked('cancel', makeRecommendation({ status: 'Cancelled' }), chair)).not.toBe('');
  });
});
