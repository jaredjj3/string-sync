import { Handler } from './types';
import session from 'express-session';
import uuid from 'uuid';
import connectRedis from 'connect-redis';

const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export const authMiddleware: Handler = (ctx) => (req, res, next) => {
  const RedisStore = connectRedis(session);
  // Problem with @types/connect-redis, typecasting to any should still work
  // https://github.com/tj/connect-redis/issues/300#issuecomment-580038867
  const store = new RedisStore({ client: ctx.redis as any });

  const sessionMiddleware = session({
    secret: 'keyboard cat',
    cookie: { httpOnly: true, sameSite: 'none', maxAge: MAX_AGE_MS },
    genid: () => uuid.v4(),
    proxy: undefined,
    resave: false,
    rolling: false,
    saveUninitialized: true,
    store,
  });

  return sessionMiddleware(req, res, next);
};
