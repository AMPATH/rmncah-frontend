import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeEvent, makeIssue, makeRecommendation, makeUser } from '../../../test/fixtures';

// A small fake json-server: each path returns test data, and every save is recorded.
const data = {
  users: [
    makeUser({ id: 'u7', role: 'COUNTY_SURVEILLANCE_LEAD', level: 'county', assignedLocations: ['Uasin Gishu County'] }),
    makeUser({ id: 'u5', role: 'PCN_COORDINATOR', level: 'sub-county', assignedLocations: ['Kapseret Sub-county'] }),
  ],
  locations: [
    { id: 'l1', name: 'Uasin Gishu County', type: 'county', parent: '' },
    { id: 'l2', name: 'Kapseret Sub-county', type: 'sub-county', parent: 'Uasin Gishu County' },
    { id: 'l3', name: 'Huruma Sub-County Hospital', type: 'facility', parent: 'Kapseret Sub-county' },
  ],
  events: [] as ReturnType<typeof makeEvent>[],
  remindersToday: [] as object[],
};

vi.mock('../../../api/apiClient', () => ({
  apiGet: vi.fn(async (path: string, params?: Record<string, string>) => {
    if (path === '/escalationMatrix') return { community: 3, facility: 3, 'sub-county': 3, county: 3 };
    if (path === '/users') return params?.id ? data.users.filter((user) => user.id === params.id) : data.users;
    if (path === '/locations') return data.locations;
    if (path.startsWith('/issues/')) return makeIssue({ loggedAt: 'Huruma Sub-County Hospital' });
    if (path === '/recommendationEvents') return data.events;
    if (path === '/notifications') return data.remindersToday;
    return [];
  }),
  apiPost: vi.fn(async () => ({})),
  apiPatch: vi.fn(async (_path: string, changes: object) => ({ ...changes })),
}));

import { apiPatch, apiPost } from '../../../api/apiClient';
import { checkAcceptanceDeadlines } from './recommendationService';

describe('checkAcceptanceDeadlines (json-server stand-in)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 16, 10, 0)); // 16 Nov 2026
    vi.mocked(apiPatch).mockClear();
    vi.mocked(apiPost).mockClear();
    data.events = [];
    data.remindersToday = [];
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const waiting = (dateLogged: string) =>
    makeRecommendation({
      id: 'r2',
      code: 'ISS-2026-0001-R2',
      status: 'Pending acceptance',
      level: 'county',
      responsiblePersonId: 'u7',
      dateLogged,
      dueDate: '2026-12-31',
    });

  it('sends one reminder a day while it waits within the deadline', async () => {
    await checkAcceptanceDeadlines([waiting('2026-11-15')]); // 1 day of 3

    expect(apiPost).toHaveBeenCalledWith(
      '/notifications',
      expect.objectContaining({ recipientId: 'u7', category: 'reminder' })
    );
    expect(apiPatch).not.toHaveBeenCalled();
  });

  it('does not remind twice on the same day', async () => {
    data.remindersToday = [{ id: 'n1' }];
    await checkAcceptanceDeadlines([waiting('2026-11-15')]);

    expect(apiPost).not.toHaveBeenCalled();
  });

  it('hands it to the PCN coordinator once the deadline has passed', async () => {
    const [result] = await checkAcceptanceDeadlines([waiting('2026-11-10')]); // 6 days, deadline 3

    expect(apiPatch).toHaveBeenCalledWith('/recommendations/r2', {
      status: 'Pending acceptance',
      level: 'sub-county',
      responsiblePersonId: 'u5',
    });
    expect(apiPost).toHaveBeenCalledWith(
      '/recommendationEvents',
      expect.objectContaining({ action: 'auto-escalated', note: 'Auto-escalated to PCN to reassign or action' })
    );
    expect(result.responsiblePersonId).toBe('u5');
  });

  it('counts the deadline from the last reassignment, not from when it was logged', async () => {
    data.events = [makeEvent({ code: 'ISS-2026-0001-R2', action: 'reassigned', at: '2026-11-15T08:00:00.000Z' })];
    await checkAcceptanceDeadlines([waiting('2026-11-01')]);

    expect(apiPatch).not.toHaveBeenCalled();
  });

  it('never moves it again once the PCN coordinator holds it', async () => {
    await checkAcceptanceDeadlines([{ ...waiting('2026-11-01'), responsiblePersonId: 'u5' }]);

    expect(apiPatch).not.toHaveBeenCalled();
  });

  it('leaves recommendations that are not waiting for acceptance alone', async () => {
    await checkAcceptanceDeadlines([makeRecommendation({ status: 'In progress', dateLogged: '2026-11-01' })]);

    expect(apiPatch).not.toHaveBeenCalled();
    expect(apiPost).not.toHaveBeenCalled();
  });
});
