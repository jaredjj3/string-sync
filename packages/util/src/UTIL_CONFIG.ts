import { CDN_DOMAIN_NAME, configFactory, LOG_LEVEL, NODE_ENV, REDIS_HOST, REDIS_PORT } from '@stringsync/config';

export const UTIL_CONFIG = configFactory({
  NODE_ENV: NODE_ENV,
  LOG_LEVEL: LOG_LEVEL,
  REDIS_HOST: REDIS_HOST,
  REDIS_PORT: REDIS_PORT,
  CDN_DOMAIN_NAME: CDN_DOMAIN_NAME,
});

export type UtilConfig = ReturnType<typeof UTIL_CONFIG>;