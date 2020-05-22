import { compose, AuthRequirements, User } from '../../../common';
import { withAuthRequirement } from '../../middlewares';
import { IFieldResolver } from 'graphql-tools';
import { ResolverCtx } from '../../../util/ctx';

export const middleware = compose(
  withAuthRequirement(AuthRequirements.LOGGED_IN_AS_ADMIN)
);

export const resolver: IFieldResolver<User, ResolverCtx> = (
  src,
  args,
  ctx,
  info
) => {
  return src.email;
};

export const email = middleware(resolver);
