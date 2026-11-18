import type { Role } from '../../../auth/permissions';
import type { LocationType } from '../../../auth/locations';
import type { Level } from '../../issues/types/issue.types';

export const roleLevels: Record<Role, Level> = {
  SYSTEM_ADMIN: 'county',
  CHP: 'community',
  FACILITY_REPORTER: 'facility',
  FACILITY_CHAIR: 'facility',
  PCN_COORDINATOR: 'sub-county',
  SUBCOUNTY_COORDINATOR: 'sub-county',
  COUNTY_SURVEILLANCE_LEAD: 'county',
};

export const placeTypeForLevel: Record<Level, LocationType> = {
  community: 'community-unit',
  facility: 'facility',
  'sub-county': 'sub-county',
  county: 'county',
};

export function roleNeedsPlaces(role: Role | ''): boolean {
  return role !== '' && role !== 'SYSTEM_ADMIN';
}

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
