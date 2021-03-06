import { UserRole } from '../domain';
import { UserRoles } from './graphqlTypes';

export const toUserRole = (role: UserRoles): UserRole => {
  switch (role) {
    case UserRoles.STUDENT:
      return UserRole.STUDENT;
    case UserRoles.TEACHER:
      return UserRole.TEACHER;
    case UserRoles.ADMIN:
      return UserRole.ADMIN;
    default:
      throw new TypeError(`cannot convert user role: ${role}`);
  }
};
