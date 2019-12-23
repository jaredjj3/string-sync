import { clearUserSessionTokenCookie } from '../../user-session/';
import { toCanonicalUser } from '../../db';
import { RequestContext } from '../../request-context';
import { LogoutPayload } from 'common/types';

interface Args {}

export const logoutResolver = async (
  parent: undefined,
  args: Args,
  ctx: RequestContext
): Promise<LogoutPayload> => {
  clearUserSessionTokenCookie(ctx.res);

  if (!ctx.auth.user) {
    return { user: null };
  }

  await ctx.db.models.UserSession.destroy({ where: { token: ctx.auth.token } });

  return { user: toCanonicalUser(ctx.auth.user) };
};