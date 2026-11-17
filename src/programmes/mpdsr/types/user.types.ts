import type { Role } from './role.types.ts';

// The four organisational levels used within MPDSR.
export type Level = 'community' | 'facility' | 'sub-county' | 'county';

// The person currently represented in the MPDSR application.
export interface User {
  id: string;
  fullName: string;
  cadre: string;
  email: string;
  level: Level;
  assignedLocations: string[];
  role: Role;
  active?: boolean;
}
