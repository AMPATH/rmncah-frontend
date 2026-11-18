import { can } from '../../../auth/permissions';
import type { User } from '../../issues/types/issue.types';

export function whyUserCantBeDeleted(user: User, byUser: User | null): string {
  if (byUser === null || !can(byUser, 'admin.setup')) return 'Only the system administrator can delete users.';
  if (user.deleted === true) return 'This user is already deleted.';
  if (user.id === byUser.id) return "You can't delete your own account.";
  return '';
}
