import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeRecommendation } from '../../../test/fixtures';

vi.mock('../../../api/apiClient', () => ({
  apiGet: vi.fn(async () => []),
  apiPost: vi.fn(async (_path: string, body: object) => ({ ...body })),
  apiPatch: vi.fn(async (_path: string, changes: object) => ({ ...changes })),
}));

import { apiPatch, apiPost } from '../../../api/apiClient';
import { addRecommendationToIssue, releaseRecommendation } from './recommendationService';

const draft = {
  gap: '3rd delay: Staff shortage',
  responsiblePersonId: 'u3',
  text: 'Roster a second midwife',
  classification: 'immediate' as const,
  level: 'facility' as const,
  dateOfCompletion: '2026-12-19',
};

describe('recommendations wait for the case review', () => {
  beforeEach(() => {
    vi.mocked(apiPost).mockClear();
    vi.mocked(apiPatch).mockClear();
  });

  it('holds a recommendation added before the review and notifies nobody', async () => {
    await addRecommendationToIssue({ id: 'i1', code: 'ISS-2026-0001' }, draft, []);

    expect(apiPost).toHaveBeenCalledWith('/recommendations', expect.objectContaining({ status: 'Pending review' }));
    expect(apiPost).not.toHaveBeenCalledWith('/notifications', expect.anything());
  });

  it('sends it to the responsible person when the review is complete', async () => {
    const held = makeRecommendation({ status: 'Pending review', level: 'facility', responsiblePersonId: 'u3' });
    await releaseRecommendation(
      held,
      'u4',
      { text: held.text, gap: held.gap, classification: held.classification, dueDate: held.dueDate, responsiblePersonId: 'u3', level: 'facility' },
      ''
    );

    expect(apiPatch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ status: 'Open' }));
    expect(apiPost).toHaveBeenCalledWith('/recommendationEvents', expect.objectContaining({ action: 'released' }));
    expect(apiPost).toHaveBeenCalledWith('/notifications', expect.objectContaining({ recipientId: 'u3', category: 'assigned' }));
  });
});
