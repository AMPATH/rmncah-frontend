import { describe, expect, it } from 'vitest';
import { makeUser } from '../../../test/fixtures';
import { countyOfPlace, responsiblePeople } from './responsiblePeople';
import type { Location } from '../../../auth/locations';

const locations: Location[] = [
  { id: 'l1', name: 'Uasin Gishu County', type: 'county', parent: '' },
  { id: 'l2', name: 'Turbo Sub-county', type: 'sub-county', parent: 'Uasin Gishu County' },
  { id: 'l3', name: 'Soy Sub-county', type: 'sub-county', parent: 'Uasin Gishu County' },
  { id: 'l4', name: 'Turbo Health Centre', type: 'facility', parent: 'Turbo Sub-county' },
  { id: 'l5', name: 'Trans Nzoia County', type: 'county', parent: '' },
  { id: 'l6', name: 'Saboti Sub-county', type: 'sub-county', parent: 'Trans Nzoia County' },
];

const users = [
  makeUser({ id: 'a', fullName: 'Turbo Coordinator', level: 'sub-county', assignedLocations: ['Turbo Sub-county'] }),
  makeUser({ id: 'b', fullName: 'Soy Coordinator', level: 'sub-county', assignedLocations: ['Soy Sub-county'] }),
  makeUser({ id: 'c', fullName: 'Saboti Coordinator', level: 'sub-county', assignedLocations: ['Saboti Sub-county'] }),
  makeUser({ id: 'd', fullName: 'Uasin Gishu Lead', level: 'county', assignedLocations: ['Uasin Gishu County'] }),
  makeUser({ id: 'e', fullName: 'Trans Nzoia Lead', level: 'county', assignedLocations: ['Trans Nzoia County'] }),
];
const ids = (list: { id: string }[]) => list.map((user) => user.id);

describe('responsiblePeople', () => {
  it('finds the county of the place where the issue was logged', () => {
    expect(countyOfPlace('Turbo Health Centre', locations)).toBe('Uasin Gishu County');
  });

  it('lists every sub-county person in the issue county, and no one from other counties', () => {
    expect(ids(responsiblePeople(users, locations, 'Turbo Health Centre', 'sub-county'))).toEqual(['b', 'a']);
  });

  it('lists only the county people of the issue county', () => {
    expect(ids(responsiblePeople(users, locations, 'Turbo Health Centre', 'county'))).toEqual(['d']);
  });
});
