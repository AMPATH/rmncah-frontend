import { backendGet } from '../../../api/backendApi';
import { delayLevels, type DelayLevel } from '../constants/delayFactors';

// A factor as the backend sends it, from GET /api/contributing-factors.
interface ContributingFactor {
  id: string;
  code: string;
  delayLevel: 'FIRST' | 'SECOND' | 'THIRD';
  name: string;
  isActive: boolean;
}

const LEVEL_ID: Record<ContributingFactor['delayLevel'], string> = { FIRST: '1st', SECOND: '2nd', THIRD: '3rd' };

// The three levels of delay, each with its active factors, in the backend's order.
export async function getDelayLevels(): Promise<DelayLevel[]> {
  const { data } = await backendGet<{ data: ContributingFactor[]; total: number }>('/contributing-factors');
  return delayLevels.map((level) => ({
    ...level,
    factors: data
      .filter((factor) => factor.isActive && LEVEL_ID[factor.delayLevel] === level.id)
      .map((factor) => factor.name),
  }));
}

// The levels with no factors yet, shown while the list loads.
export const emptyDelayLevels: DelayLevel[] = delayLevels.map((level) => ({ ...level, factors: [] }));
