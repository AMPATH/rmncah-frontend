import { describe, expect, it } from 'vitest';
import { delayGaps, delayOfGap, delaysMissing } from './delayRecommendations';

const factors = ['1st delay: Poverty', '3rd delay: Staff shortage', '1st delay: Long distance', '3rd delay: Low morale'];

describe('delay recommendations', () => {
  it('builds one gap for each level of delay', () => {
    expect(delayGaps(factors).map((item) => item.gap)).toEqual([
      '1st delay: Poverty; Long distance',
      '',
      '3rd delay: Staff shortage; Low morale',
    ]);
  });

  it('lists the delays with no factor', () => {
    expect(delaysMissing(factors)).toEqual(['2nd']);
    expect(delaysMissing([])).toEqual(['1st', '2nd', '3rd']);
  });

  it('reads the delay from a gap', () => {
    expect(delayOfGap('2nd delay: Poor roads')).toBe('2nd');
    expect(delayOfGap('Something else')).toBe('');
  });
});
