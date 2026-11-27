import type { AuthUser, ProgrammeModule } from '../services/authApi';

// Which programmes to offer on the welcome page.
// When the backend sends no roles, every programme is shown and each programme checks access itself.
export function canOpenProgramme(user: AuthUser | null, module: ProgrammeModule): boolean {
  if (!user || user.roles === undefined) return true;
  return user.roles.some((role) => role.module === module);
}
