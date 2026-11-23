import { roleLabels } from '../../../auth/permissions';
import type { Role } from '../../../auth/permissions';
import type { Location } from '../../../auth/locations';
import type { User } from '../../../features/issues/types/issue.types';

export interface ActingAsGroup {
  label: string;
  options: { id: string; text: string }[];
}

// Within one place, the most senior role comes first.
const roleOrder: Role[] = [
  'COUNTY_SURVEILLANCE_LEAD',
  'SUBCOUNTY_COORDINATOR',
  'PCN_COORDINATOR',
  'FACILITY_CHAIR',
  'FACILITY_REPORTER',
  'CHP',
  'SYSTEM_ADMIN',
];

// The chain from the place up to its county, for example [facility, sub-county, county].
function chainOf(place: string, locations: Location[]): Location[] {
  const chain: Location[] = [];
  let current = locations.find((location) => location.name === place);
  while (current && chain.length < 6) {
    chain.push(current);
    const parentName = current.parent;
    current = locations.find((location) => location.name === parentName);
  }
  return chain;
}

// Sort key that keeps each sub-county and facility together: sub-county, then facility, then role.
function treeKey(user: User & { place: string }, locations: Location[]): string[] {
  const chain = chainOf(user.place, locations);
  const nameOf = (type: string) => chain.find((location) => location.type === type)?.name ?? '';
  return [nameOf('sub-county'), nameOf('facility'), String(roleOrder.indexOf(user.role)).padStart(2, '0'), user.fullName];
}

export function actingAsGroups(users: User[], locations: Location[]): ActingAsGroup[] {
  const groups = new Map<string, (User & { place: string })[]>();

  for (const user of users) {
    if (user.deleted === true) continue;
    const place = user.assignedLocations[0] ?? '';
    const county = chainOf(place, locations).find((location) => location.type === 'county')?.name ?? '';
    const label = user.role === 'SYSTEM_ADMIN' ? 'System' : county || 'No location';
    groups.set(label, [...(groups.get(label) ?? []), { ...user, place }]);
  }

  const order = (label: string) => (label === 'System' ? 0 : label === 'No location' ? 2 : 1);

  return [...groups.entries()]
    .sort(([a], [b]) => order(a) - order(b) || a.localeCompare(b))
    .map(([label, members]) => ({
      label,
      options: members
        .map((user) => ({ user, key: treeKey(user, locations) }))
        .sort((a, b) => {
          for (let index = 0; index < a.key.length; index += 1) {
            const difference = a.key[index].localeCompare(b.key[index]);
            if (difference !== 0) return difference;
          }
          return 0;
        })
        .map(({ user }) => user)
        .map((user) => ({
          id: user.id,
          text: [user.fullName, roleLabels[user.role], user.role === 'SYSTEM_ADMIN' ? '' : user.place]
            .filter(Boolean)
            .join(' · ')
            .concat(user.active === false ? ' (deactivated)' : ''),
        })),
    }));
}