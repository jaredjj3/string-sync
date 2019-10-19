import { Db } from '../../db/createDb';
import { ContextFunction } from 'apollo-server-core';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { RequestContext, Auth } from './types';
import { getUserSessionToken } from '../user-session-token/';
import { authenticate } from './authenticate';
import { createDataLoaders } from '../../data-loaders/createDataLoaders';

export const getServerContextCreator = (
  db: Db
): ContextFunction<ExpressContext, RequestContext> => async ({ req, res }) => {
  const requestedAt = new Date();
  const token = getUserSessionToken(req);
  const user = await authenticate(token, requestedAt, db);
  const auth: Auth = { isLoggedIn: Boolean(user), user };
  const dataLoaders = createDataLoaders(db);

  return {
    req,
    res,
    db,
    auth,
    requestedAt,
    dataLoaders,
  };
};
