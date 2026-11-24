import { placesAbove, placesWithin } from '../../../auth/locations';
import type { Location } from '../../../auth/locations';
import type { Level, User } from '../types/issue.types';

// The county a place belongs to, for example the county of the facility where an issue was logged.
export function countyOfPlace(place: string, locations: Location[]): string {
  const own = locations.find((location) => location.name === place);
  if (own?.type === 'county') return own.name;
  return placesAbove(place, locations).find((location) => location.type === 'county')?.name ?? '';
}

// The people who can be made responsible at a level: staff at that level who work in the same county
// as the issue. For example, sub-county level lists every sub-county person in that county.
export function responsiblePeople(users: User[], locations: Location[], loggedAt: string, level: Level | ''): User[] {
  if (level === '') return [];
  const county = countyOfPlace(loggedAt, locations);
  const inCounty = county === '' ? null : placesWithin([county], locations);
  return users
    .filter((user) => user.level === level && user.role !== 'SYSTEM_ADMIN' && user.active !== false && user.deleted !== true)
    .filter((user) => inCounty === null || user.assignedLocations.some((place) => inCounty.has(place)))
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}
