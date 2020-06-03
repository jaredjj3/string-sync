import { GraphqlConfig } from '@stringsync/config';
import { ContainerModule } from 'inversify';
import { TYPES } from '@stringsync/common';
import { HealthCheckerService, UserService } from '@stringsync/services';

export const getServicesModule = (config: GraphqlConfig) =>
  new ContainerModule(async (bind) => {
    bind<HealthCheckerService>(TYPES.HealthCheckerService).to(HealthCheckerService);
    bind<UserService>(TYPES.UserService).to(UserService);
  });
