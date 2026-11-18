import { apiGet } from '../api/apiClient';

export type LocationType = 'county' | 'sub-county' | 'facility' | 'community-unit';

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  
  parent: string;
}

export function getLocations(): Promise<Location[]> {
  return apiGet<Location[]>('/locations');
}

export function placesWithin(names: string[], locations: Location[]): Set<string> {
  const result = new Set(names);
  let added = true;
  
  while (added) {
    added = false;
    for (const location of locations) {
      if (result.has(location.parent) && !result.has(location.name)) {
        result.add(location.name);
        added = true;
      }
    }
  }
  return result;
}

export function placesAbove(name: string, locations: Location[]): Location[] {
  const chain: Location[] = [];
  let current = locations.find((location) => location.name === name);
  while (current && current.parent) {
    const parent = locations.find((location) => location.name === current?.parent);
    if (!parent) break;
    chain.push(parent);
    current = parent;
  }
  return chain;
}
