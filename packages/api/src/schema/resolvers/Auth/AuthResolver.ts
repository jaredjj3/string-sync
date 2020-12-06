import { Resolver, Query, Ctx, Mutation, Arg, UseMiddleware } from 'type-graphql';
import { injectable, inject } from 'inversify';
import { AuthService, NotificationService } from '@stringsync/services';
import { TYPES } from '@stringsync/di';
import { Logger } from '@stringsync/util';
import { User } from '@stringsync/domain';
import { UserObject } from '../User';
import { LoginInput } from './LoginInput';
import { ForbiddenError, AuthRequirement } from '@stringsync/common';
import { WithAuthRequirement } from '../../middlewares';
import { SignupInput } from './SignupInput';
import { ConfirmEmailInput } from './ConfirmEmailInput';
import { SendResetPasswordEmailInput } from './SendResetPasswordEmailInput';
import { ResetPasswordInput } from './ResetPasswordInput';
import { ReqCtx } from '../../../ctx';

@Resolver()
@injectable()
export class AuthResolver {
  logger: Logger;
  authService: AuthService;
  notificationService: NotificationService;

  constructor(
    @inject(TYPES.Logger) logger: Logger,
    @inject(TYPES.AuthService) authService: AuthService,
    @inject(TYPES.NotificationService) notificationService: NotificationService
  ) {
    this.logger = logger;
    this.authService = authService;
    this.notificationService = notificationService;
  }

  @Query((returns) => UserObject, { nullable: true })
  async whoami(@Ctx() ctx: ReqCtx): Promise<User | null> {
    const id = this.getSessionUserId(ctx);
    return await this.authService.whoami(id);
  }

  @Mutation((returns) => UserObject, { nullable: true })
  @UseMiddleware(WithAuthRequirement(AuthRequirement.LOGGED_OUT))
  async login(@Arg('input') input: LoginInput, @Ctx() ctx: ReqCtx): Promise<User> {
    const user = await this.authService.getAuthenticatedUser(input.usernameOrEmail, input.password);
    if (!user) {
      throw new ForbiddenError('wrong username, email, or password');
    }

    this.persistLogin(ctx, user);

    return user;
  }

  @Mutation((returns) => Boolean, { nullable: true })
  @UseMiddleware(WithAuthRequirement(AuthRequirement.LOGGED_IN))
  async logout(@Ctx() ctx: ReqCtx): Promise<boolean> {
    const wasLoggedIn = ctx.req.session.user.isLoggedIn;
    this.persistLogout(ctx);
    return wasLoggedIn;
  }

  @Mutation((returns) => UserObject, { nullable: true })
  @UseMiddleware(WithAuthRequirement(AuthRequirement.LOGGED_OUT))
  async signup(@Arg('input') input: SignupInput, @Ctx() ctx: ReqCtx): Promise<User> {
    const user = await this.authService.signup(input.username, input.email, input.password);
    this.persistLogin(ctx, user);
    return user;
  }

  @Mutation((returns) => UserObject, { nullable: true })
  @UseMiddleware(WithAuthRequirement(AuthRequirement.LOGGED_IN))
  async confirmEmail(@Arg('input') input: ConfirmEmailInput, @Ctx() ctx: ReqCtx): Promise<User> {
    const id = this.getSessionUserId(ctx);
    const user = await this.authService.confirmEmail(id, input.confirmationToken, ctx.reqAt);
    return user;
  }

  @Mutation((returns) => Boolean, { nullable: true })
  @UseMiddleware(WithAuthRequirement(AuthRequirement.LOGGED_IN))
  async resendConfirmationEmail(@Ctx() ctx: ReqCtx): Promise<true> {
    const id = this.getSessionUserId(ctx);
    try {
      const user = await this.authService.resetConfirmationToken(id);
      if (user) {
        await this.notificationService.sendConfirmationEmail(user);
      }
    } catch (e) {
      this.logger.error(`resendConfirmationEmail attempted for userId: ${id}, got error ${e}`);
    }

    // Silently fail to prevent attackers from inferring the confirmation state.
    return true;
  }

  @Mutation((returns) => Boolean, { nullable: true })
  async sendResetPasswordEmail(@Ctx() ctx: ReqCtx, @Arg('input') input: SendResetPasswordEmailInput): Promise<true> {
    const user = await this.authService.refreshResetPasswordToken(input.email, ctx.reqAt);
    this.notificationService.sendResetPasswordEmail(user);
    return true;
  }

  @Mutation((returns) => Boolean, { nullable: true })
  async resetPassword(@Ctx() ctx: ReqCtx, @Arg('input') input: ResetPasswordInput): Promise<true> {
    await this.authService.resetPassword(input.resetPasswordToken, input.password, ctx.reqAt);
    return true;
  }

  private getSessionUserId(ctx: ReqCtx) {
    return ctx.req.session.user.id;
  }

  private persistLogin(ctx: ReqCtx, user: User) {
    ctx.req.session.user = this.authService.toSessionUser(user);
  }

  private persistLogout(ctx: ReqCtx) {
    ctx.req.session.user = this.authService.toSessionUser(null);
  }
}