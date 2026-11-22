import { describe, expect, it } from 'vitest';
import { filterIssues, noIssueFilters } from './issueFilters';
import type { StoredIssue } from '../services/issueService';

const issues = [
  { code: 'MP-1', issueType: 'maternal', loggedAt: 'Huruma', dateLogged: '2026-11-02', causeOfDeath: 'Eclampsia', comments: '' },
  { code: 'MP-2', issueType: 'perinatal', loggedAt: 'Langas', dateLogged: '2026-11-15', causeOfDeath: '', comments: '', review: { completedAt: 'x' } },
  { code: 'MP-3', issueType: 'maternal', loggedAt: 'Langas', dateLogged: '2026-11-20', causeOfDeath: '', comments: '', cancelled: true },
] as unknown as StoredIssue[];

const codes = (list: StoredIssue[]) => list.map((issue) => issue.code);

describe('filterIssues', () => {
  it('returns everything with no filters', () => {
    expect(codes(filterIssues(issues, noIssueFilters, null))).toEqual(['MP-1', 'MP-2', 'MP-3']);
  });

  it('filters by type, place, review state and date range', () => {
    expect(codes(filterIssues(issues, { ...noIssueFilters, issueType: 'maternal' }, null))).toEqual(['MP-1', 'MP-3']);
    expect(codes(filterIssues(issues, noIssueFilters, new Set(['Langas'])))).toEqual(['MP-2', 'MP-3']);
    expect(codes(filterIssues(issues, { ...noIssueFilters, review: 'reviewed' }, null))).toEqual(['MP-2']);
    expect(codes(filterIssues(issues, { ...noIssueFilters, review: 'cancelled' }, null))).toEqual(['MP-3']);
    expect(codes(filterIssues(issues, { ...noIssueFilters, from: '2026-11-10', to: '2026-11-16' }, null))).toEqual(['MP-2']);
  });

  it('searches code, place and cause', () => {
    expect(codes(filterIssues(issues, { ...noIssueFilters, search: 'eclam' }, null))).toEqual(['MP-1']);
    expect(codes(filterIssues(issues, { ...noIssueFilters, search: 'mp-2' }, null))).toEqual(['MP-2']);
  });
});