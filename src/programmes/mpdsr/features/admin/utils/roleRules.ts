import type { Role } from '../../../auth/permissions';
import type { LocationType } from '../../../auth/locations';
import type { Level } from '../../issues/types/issue.types';

// The level each role works at. The user's level follows from their role.
export const roleLevels: Record<Role, Level> = {
  SYSTEM_ADMIN: 'county',
  CHP: 'community',
  FACILITY_REPORTER: 'facility',
  FACILITY_CHAIR: 'facility',
  PCN_COORDINATOR: 'sub-county',
  SUBCOUNTY_COORDINATOR: 'sub-county',
  COUNTY_SURVEILLANCE_LEAD: 'county',
};

// The kind of place a user at each level is assigned to.
export const placeTypeForLevel: Record<Level, LocationType> = {
  community: 'community-unit',
  facility: 'facility',
  'sub-county': 'sub-county',
  county: 'county',
};

// The admin manages the platform and is not tied to a place.
export function roleNeedsPlaces(role: Role | ''): boolean {
  return role !== '' && role !== 'SYSTEM_ADMIN';
}

// What a place of each type sits inside ('' for a county, which sits inside nothing).
export const parentTypeOf: Record<LocationType, LocationType | ''> = {
  county: '',
  'sub-county': 'county',
  facility: 'sub-county',
  'community-unit': 'facility',
};

export const placeTypeLabels: Record<LocationType, string> = {
  county: 'County',
  'sub-county': 'Sub-county',
  facility: 'Facility',
  'community-unit': 'Community unit',
};
