import { Config } from '../config';
import { GlobalCtx } from './types';
import { getLogger } from '../util';
import { connectToDb } from '../db';
import { connectToRedis } from '../redis';
import { createQueues } from '../jobs';

export const createGlobalCtx = (config: Config): Readonly<GlobalCtx> => {
  const logger = getLogger();
  const db = connectToDb(config, logger);
  const redis = connectToRedis(config);
  const queues = createQueues(config);

  return Object.freeze({
    config,
    logger,
    db,
    redis,
    queues,
  });
};
