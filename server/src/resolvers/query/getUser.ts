import { FieldResolver } from '..';
import { UserType, GetUserInputType } from '../types';

interface Args {
  input: GetUserInputType;
}

export const getUser: FieldResolver<UserType, undefined, Args> = async (
  parent,
  args,
  ctx
) => {
  return ctx.dataLoaders.usersById.load(args.input.id);
};