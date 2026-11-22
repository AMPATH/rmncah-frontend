import { describe, expect, it } from 'vitest';
import { findDuplicates } from './duplicates';
import type { StoredIssue } from '../services/issueService';

const issues = [
  { code: 'MP-1', issueType: 'maternal', loggedAt: 'Huruma', dateOfDeath: '2026-11-20', dateOfNotification: '2026-11-21' },
  { code: 'MP-2', issueType: 'maternal', loggedAt: 'Huruma', dateOfDeath: '2026-11-20', cancelled: true },
  { code: 'MP-3', issueType: 'near-miss', loggedAt: 'Huruma', dateOfDeath: '', dateOfNotification: '2026-11-19' },
] as unknown as StoredIssue[];

describe('findDuplicates', () => {
  it('finds the same type, place and date of death, skipping cancelled issues', () => {
    const found = findDuplicates(issues, { issueType: 'maternal', loggedAt: 'Huruma', dateOfDeath: '2026-11-20', dateOfNotification: '' });
    expect(found.map((issue) => issue.code)).toEqual(['MP-1']);
  });

  it('uses the date of notification for a near miss', () => {
    const found = findDuplicates(issues, { issueType: 'near-miss', loggedAt: 'Huruma', dateOfDeath: '', dateOfNotification: '2026-11-19' });
    expect(found.map((issue) => issue.code)).toEqual(['MP-3']);
  });

  it('finds nothing until the details are filled in, or when the place differs', () => {
    expect(findDuplicates(issues, { issueType: 'maternal', loggedAt: 'Huruma', dateOfDeath: '', dateOfNotification: '' })).toEqual([]);
    expect(findDuplicates(issues, { issueType: 'maternal', loggedAt: 'Other', dateOfDeath: '2026-11-20', dateOfNotification: '' })).toEqual([]);
  });
});