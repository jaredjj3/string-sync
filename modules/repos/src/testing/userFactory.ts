import { User, UserRole } from '@stringsync/domain';
import { randStr } from '@stringsync/common';

export const userFactory = (attrs: Partial<User> = {}): User => {
  const now = new Date();

  return {
    id: randStr(8),
    username: randStr(8),
    email: `${randStr(8)}@${randStr(5)}.com`,
    createdAt: now,
    updatedAt: now,
    role: 'student' as UserRole,
    avatarUrl: null,
    confirmationToken: null,
    confirmedAt: null,
    encryptedPassword: '$2b$10$OlF1bUqORoywn42UmkEq/O9H5X3QdDG8Iwn5tPuBFjGqGo3dA7mDe', // password = 'password',
    resetPasswordToken: null,
    resetPasswordTokenSentAt: null,
    ...attrs,
  };
};