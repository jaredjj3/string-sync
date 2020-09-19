import { injectable, inject } from 'inversify';
import url from 'url';
import { TYPES } from '@stringsync/di';
import { ContainerConfig } from '@stringsync/config';
import { User } from '@stringsync/domain';
import { Mailer } from '@stringsync/util';

@injectable()
export class NotificationService {
  static INFO_EMAIL = 'StringSync <info@stringsync.com>';

  mailer: Mailer;
  config: ContainerConfig;

  constructor(@inject(TYPES.Mailer) mailer: Mailer, @inject(TYPES.ContainerConfig) config: ContainerConfig) {
    this.mailer = mailer;
    this.config = config;
  }

  async sendConfirmationEmail(user: User): Promise<void> {
    const confirmHref = url.format({
      protocol: 'https',
      hostname: this.config.WEB_URI,
      pathname: 'confirm-email',
      query: { confirmationToken: user.confirmationToken },
    });

    this.mailer.send({
      subject: 'Confirm your email for StringSync',
      from: NotificationService.INFO_EMAIL,
      to: user.email,
      html: `
        <p>
          Please confirm your email for <a href="${confirmHref}">StringSync<a/>
        </p>
      `,
    });
  }

  async sendResetPasswordEmail(user: User): Promise<void> {
    if (!user.resetPasswordToken) {
      throw new Error('user must have a reset password token');
    }

    const resetPasswordHref = url.format({
      protocol: 'https',
      hostname: this.config.WEB_URI,
      pathname: 'reset-password',
      query: { resetPasswordToken: user.resetPasswordToken },
    });

    this.mailer.send({
      subject: 'Reset your password for StringSync',
      from: NotificationService.INFO_EMAIL,
      to: user.email,
      html: `
        <p>
          Reset your password at <a href="${resetPasswordHref}">StringSync<a/>
        </p>
      `,
    });
  }
}