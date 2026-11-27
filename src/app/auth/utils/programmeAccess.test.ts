import { describe, expect, it } from 'vitest';
import { canOpenProgramme } from './programmeAccess';
import type { AuthUser } from '../services/authApi';

const base: AuthUser = {
  id: '1',
  firstName: 'Test',
  lastName: 'Mentor 01',
  email: 'test.mentor01@mpdsr.test',
  status: 'ACTIVE',
  mustChangePassword: false,
};

describe('canOpenProgramme', () => {
  it('shows every programme while the backend sends no roles', () => {
    expect(canOpenProgramme(base, 'MPDSR')).toBe(true);
    expect(canOpenProgramme(base, 'EMONC')).toBe(true);
  });

  it('shows only the programmes the user has a role in', () => {
    const mentor = { ...base, roles: [{ code: 'MENTOR', module: 'EMONC' as const }] };
    expect(canOpenProgramme(mentor, 'EMONC')).toBe(true);
    expect(canOpenProgramme(mentor, 'MPDSR')).toBe(false);
  });

  it('shows none when the user has no programme roles', () => {
    const admin = { ...base, roles: [{ code: 'SYSTEM_ADMIN', module: 'PLATFORM' as const }] };
    expect(canOpenProgramme(admin, 'MPDSR')).toBe(false);
    expect(canOpenProgramme(admin, 'EMONC')).toBe(false);
  });
});
