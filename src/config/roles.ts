export type UserRole =
  | 'program-lead'
  | 'county-mentor'
  | 'mentor'
  | 'mentee'
  | 'developer'

export interface RoleOption {
  id: UserRole
  label: string
  shortLabel: string
}

export const roles: RoleOption[] = [
  {
    id: 'program-lead',
    label: 'Program Lead',
    shortLabel: 'PL',
  },
  {
    id: 'county-mentor',
    label: 'County Mentor / RH / MOH',
    shortLabel: 'CM',
  },
  {
    id: 'mentor',
    label: 'Mentor',
    shortLabel: 'M',
  },
  {
    id: 'mentee',
    label: 'Mentee',
    shortLabel: 'ME',
  },
  {
    id: 'developer',
    label: 'Developer / System Administrator',
    shortLabel: 'SA',
  },
]
