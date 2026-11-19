import { describe, expect, it } from 'vitest';
import { can, rolePermissions } from './permissions';
import type { Role } from './permissions';

describe('who can log issues', () => {
  const roles = Object.keys(rolePermissions) as Role[];

  it('lets only the CHP and the facility reporter log issues', () => {
    const loggers = roles.filter((role) => can({ role }, 'issue.log'));
    expect(loggers.sort()).toEqual(['CHP', 'FACILITY_REPORTER']);
  });

  it('lets only the facility MPDSR chair review a case', () => {
    expect(roles.filter((role) => can({ role }, 'issue.review'))).toEqual(['FACILITY_CHAIR']);
  });

  it('lets only the facility reporter log near misses', () => {
    expect(roles.filter((role) => can({ role }, 'issue.logNearMiss'))).toEqual(['FACILITY_REPORTER']);
  });
});
