// Roles and what each role may do. The whole app asks can(user, permission)
// instead of checking roles itself, so a rule only ever changes here.
// Role codes, names and descriptions match the backend's predefined roles.
// The backend enforces the same rules on the server; these checks only shape the screens.

export type Role =
  | 'SYSTEM_ADMIN'
  | 'CHP'
  | 'FACILITY_REPORTER'
  | 'FACILITY_CHAIR'
  | 'PCN_COORDINATOR'
  | 'SUBCOUNTY_COORDINATOR'
  | 'COUNTY_SURVEILLANCE_LEAD';

// Which part of the system a role belongs to (the backend's SystemModule).
export type SystemModule = 'PLATFORM' | 'MPDSR';

export const roleModules: Record<Role, SystemModule> = {
  SYSTEM_ADMIN: 'PLATFORM',
  CHP: 'MPDSR',
  FACILITY_REPORTER: 'MPDSR',
  FACILITY_CHAIR: 'MPDSR',
  PCN_COORDINATOR: 'MPDSR',
  SUBCOUNTY_COORDINATOR: 'MPDSR',
  COUNTY_SURVEILLANCE_LEAD: 'MPDSR',
};

export const roleLabels: Record<Role, string> = {
  SYSTEM_ADMIN: 'System Administrator',
  CHP: 'Community Health Provider',
  FACILITY_REPORTER: 'Facility Reporter',
  FACILITY_CHAIR: 'Facility MPDSR Chair',
  PCN_COORDINATOR: 'PCN Coordinator',
  SUBCOUNTY_COORDINATOR: 'Sub-county Coordinator',
  COUNTY_SURVEILLANCE_LEAD: 'County Surveillance Lead',
};

export const roleDescriptions: Record<Role, string> = {
  SYSTEM_ADMIN:
    'Manages platform administration, system configuration, accounts and access. Does not automatically grant access to identifiable clinical records.',
  CHP: 'Reports community incidents and accesses records within the assigned community unit.',
  FACILITY_REPORTER:
    'Reports facility incidents and follows up on submissions within the assigned facility.',
  FACILITY_CHAIR:
    'Coordinates facility reviews and approves completed action points where authorized.',
  PCN_COORDINATOR:
    'Handles overdue and unaccepted recommendations, reassigns work or accepts responsibility.',
  SUBCOUNTY_COORDINATOR:
    'Monitors MPDSR activities and performance within the assigned sub-county.',
  COUNTY_SURVEILLANCE_LEAD: 'Provides county-level MPDSR oversight and reporting.',
};

export type Permission =
  | 'issue.log'
  | 'issue.logNearMiss'
  | 'recommendation.add'
  | 'recommendation.accept'
  | 'recommendation.escalate'
  | 'recommendation.markDone'
  | 'recommendation.approve'
  | 'recommendation.reassign'
  | 'reports.view'
  | 'admin.setup';

// What anyone who can be given a recommendation may do with it.
const holder: Permission[] = [
  'recommendation.accept',
  'recommendation.escalate',
  'recommendation.markDone',
];

export const rolePermissions: Record<Role, Permission[]> = {
  // Platform only: no MPDSR records, and so no reports.
  SYSTEM_ADMIN: ['admin.setup'],
  CHP: ['issue.log', 'recommendation.add', ...holder, 'reports.view'],
  FACILITY_REPORTER: [
    'issue.log',
    'issue.logNearMiss',
    'recommendation.add',
    ...holder,
    'reports.view',
  ],
  FACILITY_CHAIR: [
    'issue.log',
    'issue.logNearMiss',
    'recommendation.add',
    ...holder,
    'recommendation.approve',
    'reports.view',
  ],
  PCN_COORDINATOR: [...holder, 'recommendation.reassign', 'reports.view'],
  SUBCOUNTY_COORDINATOR: [...holder, 'reports.view'],
  COUNTY_SURVEILLANCE_LEAD: [...holder, 'reports.view'],
};

// The smallest shape can() needs, so it works with any user object that has a role.
interface HasRole {
  role: Role;
}

export function can(user: HasRole | null, permission: Permission): boolean {
  if (!user) {
    return false;
  }
  return rolePermissions[user.role].includes(permission);
}

// True if the user has at least one of the permissions (or none are required).
export function canAny(user: HasRole | null, permissions: Permission[]): boolean {
  return permissions.length === 0 || permissions.some((permission) => can(user, permission));
}
