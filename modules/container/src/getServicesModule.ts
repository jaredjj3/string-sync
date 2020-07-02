import { ContainerConfig } from '@stringsync/config';
import { ContainerModule } from 'inversify';
import { TYPES } from '@stringsync/container';
import { UserService, HealthCheckerService, AuthService, NotationService, TagService } from '@stringsync/services';
import { NotificationService } from '@stringsync/services/src/notification';

export const getServicesModule = (config: ContainerConfig) =>
  new ContainerModule(async (bind) => {
    bind<HealthCheckerService>(TYPES.HealthCheckerService).to(HealthCheckerService);
    bind<AuthService>(TYPES.AuthService).to(AuthService);
    bind<NotificationService>(TYPES.NotificationService).to(NotificationService);

    bind<UserService>(TYPES.UserService)
      .to(UserService)
      .inRequestScope();
    bind<NotationService>(TYPES.NotationService)
      .to(NotationService)
      .inRequestScope();
    bind<TagService>(TYPES.TagService)
      .to(TagService)
      .inRequestScope();
  });
