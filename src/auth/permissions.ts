// Roles and what each role may do. The whole app asks can(user, permission)
// instead of checking roles itself, so a rule only ever changes here.
// The backend team enforces the same rules on the server; these checks only shape the screens.

export type Role =
  | 'community-user'
  | 'facility-user'
  | 'facility-chair'
  | 'pcn-coordinator'
  | 'sub-county-user'
  | 'county-user'
  | 'admin';

export const roleLabels: Record<Role, string> = {
  'community-user': 'Community user',
  'facility-user': 'Facility user',
  'facility-chair': 'Facility MPDSR chair',
  'pcn-coordinator': 'PCN coordinator',
  'sub-county-user': 'Sub-county user',
  'county-user': 'County user',
  admin: 'Admin',
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

// The things every role that holds recommendations can do.
const holder: Permission[] = [
  'recommendation.accept',
  'recommendation.escalate',
  'recommendation.markDone',
  'reports.view',
];

export const rolePermissions: Record<Role, Permission[]> = {
  'community-user': ['issue.log', 'recommendation.add', ...holder],
  'facility-user': ['issue.log', 'issue.logNearMiss', 'recommendation.add', ...holder],
  'facility-chair': [
    'issue.log',
    'issue.logNearMiss',
    'recommendation.add',
    ...holder,
    'recommendation.approve',
  ],
  'pcn-coordinator': [...holder, 'recommendation.reassign'],
  'sub-county-user': holder,
  'county-user': holder,
  admin: ['reports.view', 'admin.setup'],
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
