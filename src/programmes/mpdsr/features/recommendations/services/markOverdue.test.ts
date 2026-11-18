import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeRecommendation } from '../../../test/fixtures';

vi.mock('../../../api/apiClient', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(async () => ({})),
  apiPatch: vi.fn(async (_path: string, changes: object) => ({ ...changes })),
}));

import { apiPatch, apiPost } from '../../../api/apiClient';
import { markOverdue } from './recommendationService';

describe('markOverdue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 16, 10, 0));
    vi.mocked(apiPatch).mockClear();
    vi.mocked(apiPost).mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('marks running work past its due date as Overdue', async () => {
    const late = makeRecommendation({ id: 'r1', status: 'In progress', dueDate: '2026-11-15' });

    const [result] = await markOverdue([late]);

    expect(result.status).toBe('Overdue');
    expect(apiPatch).toHaveBeenCalledWith('/recommendations/r1', { status: 'Overdue' });
  });

  it('records the step in the history and tells the person holding it', async () => {
    await markOverdue([makeRecommendation({ status: 'Open', dueDate: '2026-11-01', responsiblePersonId: 'u7' })]);

    expect(apiPost).toHaveBeenCalledWith(
      '/recommendationEvents',
      expect.objectContaining({ action: 'marked-overdue', fromStatus: 'Open', toStatus: 'Overdue' })
    );
    expect(apiPost).toHaveBeenCalledWith(
      '/notifications',
      expect.objectContaining({ recipientId: 'u7', category: 'overdue' })
    );
  });

  it('leaves work that is due today or later alone', async () => {
    await markOverdue([
      makeRecommendation({ code: 'A', dueDate: '2026-11-16' }),
      makeRecommendation({ code: 'B', dueDate: '2026-12-01' }),
    ]);

    expect(apiPatch).not.toHaveBeenCalled();
  });

  it('never touches closed, already overdue or submitted work', async () => {
    await markOverdue([
      makeRecommendation({ code: 'A', status: 'Closed', dueDate: '2026-11-01' }),
      makeRecommendation({ code: 'B', status: 'Overdue', dueDate: '2026-11-01' }),
      makeRecommendation({ code: 'C', status: 'Pending approval', dueDate: '2026-11-01' }),
    ]);

    expect(apiPatch).not.toHaveBeenCalled();
  });
});
