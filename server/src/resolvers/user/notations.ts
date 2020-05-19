import { User } from '../../common/types';
import { ReqCtx } from '../../util/ctx';

interface Args {}

export const notations = (user: User, args: Args, ctx: ReqCtx) => {
  return ctx.dataLoaders.notationsByUserId.load(user.id);
};
