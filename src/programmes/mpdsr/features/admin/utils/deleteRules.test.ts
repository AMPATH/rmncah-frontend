import { describe, expect, it } from 'vitest';
import { makeUser } from '../../../test/fixtures';
import { whyUserCantBeDeleted } from './deleteRules';

describe('whyUserCantBeDeleted', () => {
  const admin = makeUser({ id: 'a1', role: 'SYSTEM_ADMIN' });
  const reporter = makeUser({ id: 'u3', role: 'FACILITY_REPORTER' });

  it('lets the system administrator delete another user', () => {
    expect(whyUserCantBeDeleted(reporter, admin)).toBe('');
  });

  it('stops anyone who is not the system administrator', () => {
    expect(whyUserCantBeDeleted(admin, reporter)).not.toBe('');
  });

  it('stops the administrator deleting their own account', () => {
    expect(whyUserCantBeDeleted(admin, admin)).not.toBe('');
  });

  it('stops deleting someone already deleted', () => {
    expect(whyUserCantBeDeleted({ ...reporter, deleted: true }, admin)).not.toBe('');
  });
});
