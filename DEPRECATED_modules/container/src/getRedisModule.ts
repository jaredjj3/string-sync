import { ContainerModule } from 'inversify';
import { ContainerConfig } from '@stringsync/config';
import IORedis, { Redis } from 'ioredis';
import { TYPES } from '@stringsync/container';

export const getRedisModule = (config: ContainerConfig) =>
  new ContainerModule((bind) => {
    const redis = new IORedis({
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
    });
    bind<Redis>(TYPES.Redis).toConstantValue(redis);
  });