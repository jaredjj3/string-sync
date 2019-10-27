import { FieldResolver } from '..';
import { LogoutPayload } from 'common/types';
import { clearUserSessionTokenCookie } from '../../modules/user-session/';

export const logout: FieldResolver<LogoutPayload> = (parent, args, ctx) => {
  clearUserSessionTokenCookie(ctx.res);
  return { user: ctx.auth.user };
};
