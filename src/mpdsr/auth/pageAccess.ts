import type { Permission } from './permissions';

// Which permission each page needs. Pages not listed here are open to every signed-in user.
// The sidebar hides pages a user can't open, and the layout blocks them if typed in.
export const pagePermissions: { pathStart: string; anyOf: Permission[] }[] = [
  { pathStart: '/issues/new', anyOf: ['issue.log'] },
  { pathStart: '/issues/', anyOf: ['recommendation.add', 'reports.view'] },
  { pathStart: '/issues', anyOf: ['recommendation.add', 'reports.view'] },
  { pathStart: '/actions/overdue', anyOf: ['recommendation.reassign'] },
  { pathStart: '/actions/', anyOf: ['recommendation.accept', 'recommendation.markDone', 'recommendation.approve'] },
  { pathStart: '/reports', anyOf: ['reports.view'] },
  { pathStart: '/admin/', anyOf: ['admin.setup'] },
  { pathStart: '/recommendations/', anyOf: ['recommendation.accept', 'recommendation.add', 'reports.view'] },
];

// The rule for a path: the first entry whose pathStart matches.
export function permissionsForPath(path: string): Permission[] {
  // /actions/draft/close needs the close-out permissions, /actions/draft/respond the accept ones.
  if (path.startsWith('/actions/') && path.endsWith('/close')) {
    return ['recommendation.markDone', 'recommendation.approve'];
  }
  if (path.startsWith('/issues/') && path.endsWith('/edit')) {
    return ['recommendation.add'];
  }
  if (path.startsWith('/issues/') && path.endsWith('/recommendation')) {
    return ['recommendation.add'];
  }
  if (path.startsWith('/actions/') && path.endsWith('/edit')) {
    return ['recommendation.add', 'recommendation.approve'];
  }
  if (path.startsWith('/actions/') && path.endsWith('/reassign')) {
    return ['recommendation.reassign'];
  }
  if (path.startsWith('/actions/') && path.endsWith('/respond')) {
    return ['recommendation.accept', 'recommendation.escalate'];
  }
  return pagePermissions.find((rule) => path.startsWith(rule.pathStart))?.anyOf ?? [];
}
