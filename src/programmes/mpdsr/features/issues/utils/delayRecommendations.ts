import { delayLevels } from '../constants/delayFactors';

// Every issue has exactly one recommendation for each level of delay (1st, 2nd and 3rd).
// The gap of that recommendation is the factors ticked for that delay, for example
// "1st delay: Poverty; Long distance".

export interface DelayGap {
  delay: string;
  title: string;
  factors: string[];
  gap: string;
}

function prefixOf(delay: string) {
  return `${delay} delay: `;
}

export function delayGaps(selectedFactors: string[]): DelayGap[] {
  return delayLevels.map((level) => {
    const prefix = prefixOf(level.id);
    const factors = selectedFactors.filter((factor) => factor.startsWith(prefix)).map((factor) => factor.slice(prefix.length));
    return {
      delay: level.id,
      title: level.title,
      factors,
      gap: factors.length > 0 ? `${prefix}${factors.join('; ')}` : '',
    };
  });
}

// The delays that have no factor ticked yet.
export function delaysMissing(selectedFactors: string[]): string[] {
  return delayGaps(selectedFactors)
    .filter((item) => item.factors.length === 0)
    .map((item) => item.delay);
}

// Which delay a recommendation belongs to, read from the start of its gap.
export function delayOfGap(gap: string): string {
  return delayLevels.find((level) => gap.startsWith(prefixOf(level.id)))?.id ?? '';
}
