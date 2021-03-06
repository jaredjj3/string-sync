import { toUserRole, UserObject } from '../../graphql';
import { AuthUser } from './types';

export const toAuthUser = (user: UserObject): AuthUser => ({
  id: user.id,
  email: user.email,
  role: toUserRole(user.role),
  username: user.username,
  confirmedAt: user.confirmedAt || null,
});
