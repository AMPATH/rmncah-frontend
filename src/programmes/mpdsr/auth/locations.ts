import { apiGet } from '../services/apiClient';

// The place hierarchy from the setup table: county → sub-county → facility → community unit.
export type LocationType = 'county' | 'sub-county' | 'facility' | 'community-unit';

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  // The name of the place this one belongs to ('' for a county).
  parent: string;
}

export function getLocations(): Promise<Location[]> {
  return apiGet<Location[]>('/locations');
}

// A place, followed by every place inside it (all levels down).
export function placesWithin(names: string[], locations: Location[]): Set<string> {
  const result = new Set(names);
  let added = true;
  // Keep adding children of places already in the set until nothing new is found.
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

// The chain of places above a place, e.g. facility → its sub-county → its county.
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
