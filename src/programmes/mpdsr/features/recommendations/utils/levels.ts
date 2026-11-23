import type { Level } from '../../issues/types/issue.types';

// From lowest to highest: CHP (community), facility, sub-county, county.
export const levelOrder: Level[] = ['community', 'facility', 'sub-county', 'county'];

export const levelLabels: Record<Level, string> = {
  community: 'Community (CHP)',
  facility: 'Facility',
  'sub-county': 'Sub-county',
  county: 'County',
};

// A near miss happens at a facility, so it is never handled at the community level.
export function levelsFor(issueType?: string): Level[] {
  return issueType === 'near-miss' ? levelOrder.filter((level) => level !== 'community') : levelOrder;
}

// Escalating only goes up the levels, and de-escalating only goes down.
export function moveTargets(current: Level | '', action: 'escalate' | 'de-escalate' | '', issueType?: string): Level[] {
  if (current === '' || action === '') return [];
  const position = levelOrder.indexOf(current);
  return levelsFor(issueType).filter((level) =>
    action === 'escalate' ? levelOrder.indexOf(level) > position : levelOrder.indexOf(level) < position
  );
}

export function isAllowedMove(
  current: Level | '',
  action: 'escalate' | 'de-escalate',
  target: Level,
  issueType?: string
): boolean {
  return moveTargets(current, action, issueType).includes(target);
}