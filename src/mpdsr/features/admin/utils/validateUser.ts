import type { User } from '../../issues/types/issue.types';
import type { UserFormValues } from '../components/UserForm';
import { roleNeedsPlaces } from './roleRules';

// The problems with the form, by field. Empty when it can be saved.
// The backend checks the same rules (and email uniqueness) again.
export function validateUser(
  values: UserFormValues,
  users: User[],
  editingId: string | null
): Partial<Record<keyof UserFormValues, string>> {
  const errors: Partial<Record<keyof UserFormValues, string>> = {};
  const email = values.email.trim().toLowerCase();

  if (values.fullName.trim() === '') errors.fullName = 'Enter the full name';
  if (values.cadre.trim() === '') errors.cadre = 'Enter the cadre';
  if (email === '') {
    errors.email = 'Enter the email';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email, e.g. name@example.org';
  } else if (users.some((user) => (user.email ?? '').toLowerCase() === email && user.id !== editingId)) {
    errors.email = 'Another user already has this email';
  }
  if (values.role === '') errors.role = 'Choose a role';
  if (roleNeedsPlaces(values.role) && values.assignedLocations.length === 0) {
    errors.assignedLocations = 'Choose at least one place';
  }

  return errors;
}
