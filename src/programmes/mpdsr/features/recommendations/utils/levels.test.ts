import { describe, expect, it } from 'vitest';
import { isAllowedMove, levelsFor, moveTargets } from './levels';

describe('levelsFor', () => {
  it('leaves out community for a near miss', () => {
    expect(levelsFor('near-miss')).toEqual(['facility', 'sub-county', 'county']);
    expect(levelsFor('maternal')).toEqual(['community', 'facility', 'sub-county', 'county']);
  });
});

describe('moveTargets', () => {
  it('escalates only upwards', () => {
    expect(moveTargets('community', 'escalate')).toEqual(['facility', 'sub-county', 'county']);
    expect(moveTargets('sub-county', 'escalate')).toEqual(['county']);
    expect(moveTargets('county', 'escalate')).toEqual([]);
  });

  it('de-escalates only downwards', () => {
    expect(moveTargets('county', 'de-escalate')).toEqual(['community', 'facility', 'sub-county']);
    expect(moveTargets('facility', 'de-escalate')).toEqual(['community']);
    expect(moveTargets('community', 'de-escalate')).toEqual([]);
  });

  it('never de-escalates a near miss to the community', () => {
    expect(moveTargets('facility', 'de-escalate', 'near-miss')).toEqual([]);
    expect(moveTargets('county', 'de-escalate', 'near-miss')).toEqual(['facility', 'sub-county']);
  });

  it('checks a single move', () => {
    expect(isAllowedMove('facility', 'escalate', 'county')).toBe(true);
    expect(isAllowedMove('facility', 'escalate', 'community')).toBe(false);
    expect(isAllowedMove('sub-county', 'de-escalate', 'county')).toBe(false);
  });
});