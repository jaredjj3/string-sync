import { UserModel } from '../models/UserModel';
import { UserType } from '../resolvers/types';

export const getUserType = (userRecord: UserModel): UserType => {
  return {
    id: userRecord.id,
    username: userRecord.username,
    email: userRecord.email,
    createdAt: userRecord.createdAt,
    updatedAt: userRecord.updatedAt,
  };
};