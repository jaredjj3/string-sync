import { LoginInput, LoginOutput } from '../../common';
import { isPassword } from '../../util/password';
import { toCanonicalUser } from '../../data/db';
import { GraphQLCtx } from '../../util/ctx';
import { or } from 'sequelize';
import { IFieldResolver } from 'graphql-tools';

interface Args {
  input: LoginInput;
}

export const WRONG_CREDENTIALS_MSG = 'wrong username, email, or password';

type LoginResolver = IFieldResolver<
  undefined,
  GraphQLCtx,
  { input: LoginInput }
>;

export const login: LoginResolver = async (
  src,
  args,
  ctx
): Promise<LoginOutput> => {
  const userModel = await ctx.db.models.User.findOne({
    where: {
      ...or(
        { username: args.input.emailOrUsername },
        { email: args.input.emailOrUsername }
      ),
    },
  });

  if (!userModel) {
    throw new Error(WRONG_CREDENTIALS_MSG);
  }

  if (!(await isPassword(args.input.password, userModel.encryptedPassword))) {
    throw new Error(WRONG_CREDENTIALS_MSG);
  }

  // const userSessionModel = await ctx.db.models.UserSession.create({
  //   issuedAt: ctx.reqAt,
  //   userId: userModel.id,
  //   expiresAt: getExpiresAt(ctx.reqAt),
  // });

  // setUserSessionTokenCookie(userSessionModel, ctx.res);

  return { user: toCanonicalUser(userModel) };
};
