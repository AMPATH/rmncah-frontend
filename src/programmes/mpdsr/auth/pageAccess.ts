import type { Permission } from './permissions';

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

export function permissionsForPath(path: string): Permission[] {
  
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
