// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getCausesOfDeath } from '../features/issues/services/causeService';
import { getDelayLevels } from '../features/issues/services/contributingFactorService';
import { backendGetAll } from './backendApi';

const page = (data: unknown[], pageNo: number, totalPages: number) =>
  new Response(
    JSON.stringify({ success: true, data, meta: { total: data.length * totalPages, page: pageNo, limit: 100, totalPages } }),
    { status: 200 },
  );
const urlOf = (call: unknown[]) => String(call[0]);

describe('lists from the backend', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('rmncah.accessToken', 'a1');
  });
  afterEach(() => vi.unstubAllGlobals());

  it('reads every page of a paged list', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(page([1, 2], 1, 3))
      .mockResolvedValueOnce(page([3, 4], 2, 3))
      .mockResolvedValueOnce(page([5], 3, 3));
    vi.stubGlobal('fetch', fetchMock);
    expect(await backendGetAll<number>('/icd11-causes', { caseType: 'MATERNAL' })).toEqual([1, 2, 3, 4, 5]);
    expect(urlOf(fetchMock.mock.calls[2])).toContain('page=3');
    expect(urlOf(fetchMock.mock.calls[2])).toContain('caseType=MATERNAL');
  });

  it('turns ICD-11 causes into causes of death for maternal and perinatal cases', async () => {
    const fetchMock = vi.fn((url: string) =>
      Promise.resolve(
        url.includes('MATERNAL')
          ? page([{ id: 'm1', code: 'JA00', description: 'Abortion' }], 1, 1)
          : page([{ id: 'p1', code: 'KA00', description: 'Fetus affected by maternal conditions' }], 1, 1),
      ),
    );
    vi.stubGlobal('fetch', fetchMock);
    const causes = await getCausesOfDeath();
    expect(causes).toEqual([
      { id: 'm1', code: 'JA00', name: 'Abortion', appliesTo: 'maternal', active: true },
      { id: 'p1', code: 'KA00', name: 'Fetus affected by maternal conditions', appliesTo: 'perinatal', active: true },
    ]);
    await getCausesOfDeath();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('groups contributing factors by level of delay', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            success: true,
            data: {
              total: 4,
              data: [
                { id: '1', code: 'D1_004', delayLevel: 'FIRST', name: 'Poverty', isActive: true },
                { id: '2', code: 'D2_004', delayLevel: 'SECOND', name: 'Long distance', isActive: true },
                { id: '3', code: 'D3_001', delayLevel: 'THIRD', name: 'Staff shortage', isActive: true },
                { id: '4', code: 'D3_002', delayLevel: 'THIRD', name: 'Retired factor', isActive: false },
              ],
            },
          }),
          { status: 200 },
        ),
      ),
    );
    const levels = await getDelayLevels();
    expect(levels.map((level) => [level.id, level.factors])).toEqual([
      ['1st', ['Poverty']],
      ['2nd', ['Long distance']],
      ['3rd', ['Staff shortage']],
    ]);
  });
});
