import { describe, expect, it } from 'vitest';
import { actingAsGroups } from './actingAsGroups';
import { makeUser } from '../../../test/fixtures';
import type { Location } from '../../../auth/locations';

const locations: Location[] = [
  { id: 'c1', name: 'Uasin Gishu County', type: 'county', parent: '' },
  { id: 's1', name: 'Kapseret Sub-county', type: 'sub-county', parent: 'Uasin Gishu County' },
  { id: 'f1', name: 'Huruma Hospital', type: 'facility', parent: 'Kapseret Sub-county' },
  { id: 'u1', name: 'Langas Unit', type: 'community-unit', parent: 'Huruma Hospital' },
  { id: 'c2', name: 'West Pokot County', type: 'county', parent: '' },
];

describe('actingAsGroups', () => {
  it('puts the admin first, then counties, each ordered as a tree from the county down', () => {
    const groups = actingAsGroups(
      [
        makeUser({ id: 'a', fullName: 'Faith', role: 'CHP', assignedLocations: ['Langas Unit'] }),
        makeUser({ id: 'b', fullName: 'Brian', role: 'FACILITY_REPORTER', assignedLocations: ['Huruma Hospital'] }),
        makeUser({ id: 'c', fullName: 'Daniel', role: 'COUNTY_SURVEILLANCE_LEAD', assignedLocations: ['Uasin Gishu County'] }),
        makeUser({ id: 'd', fullName: 'Isaac', role: 'COUNTY_SURVEILLANCE_LEAD', assignedLocations: ['West Pokot County'] }),
        makeUser({ id: 'e', fullName: 'Admin', role: 'SYSTEM_ADMIN', assignedLocations: [] }),
        makeUser({ id: 'g', fullName: 'Agnes', role: 'FACILITY_CHAIR', assignedLocations: ['Huruma Hospital'] }),
        makeUser({ id: 'h', fullName: 'Ruth', role: 'SUBCOUNTY_COORDINATOR', assignedLocations: ['Kapseret Sub-county'] }),
        makeUser({ id: 'f', fullName: 'Gone', role: 'CHP', assignedLocations: ['Langas Unit'], deleted: true }),
      ],
      locations
    );

    expect(groups.map((group) => group.label)).toEqual(['System', 'Uasin Gishu County', 'West Pokot County']);
    expect(groups[1].options.map((option) => option.id)).toEqual(['c', 'h', 'g', 'b', 'a']);
    expect(groups[1].options[3].text).toBe('Brian · Facility Reporter · Huruma Hospital');
    expect(groups[0].options[0].text).toBe('Admin · System Administrator');
  });
});