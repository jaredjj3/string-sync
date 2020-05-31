import session from 'express-session';
import uuid from 'uuid';
import connectRedis from 'connect-redis';
import { Handler } from 'express';
import { Container } from 'inversify';
import { Config } from '../../config';
import { TYPES } from '../../container';
import { Redis } from 'ioredis';

const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export const withSession = (container: Container): Handler => {
  const config = container.get<Config>(TYPES.Config);
  const redis = container.get<Redis>(TYPES.Redis);

  const RedisStore = connectRedis(session);
  const store = new RedisStore({ client: redis });

  return session({
    secret: config.SESSION_SECRET,
    cookie: { httpOnly: true, sameSite: 'none', maxAge: MAX_AGE_MS },
    genid: () => uuid.v4(),
    proxy: undefined,
    resave: false,
    rolling: false,
    saveUninitialized: false,
    store,
  }) as Handler;
};