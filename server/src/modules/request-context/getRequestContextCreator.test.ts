import { getCookies } from './getCookies';
import { getAuthenticatedUser } from './getAuthenticatedUser';
import { createDb } from '../../db';
import { getRequestContextCreator } from './getRequestContextCreator';
import { createDataLoaders } from '../../modules/data-loaders/createDataLoaders';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';

jest.mock('./getCookies', () => ({
  getCookies: jest.fn().mockReturnValue({}),
}));

jest.mock('./getAuthenticatedUser', () => ({
  getAuthenticatedUser: jest.fn().mockReturnValue({}),
}));

jest.mock('../../modules/data-loaders/createDataLoaders', () => ({
  createDataLoaders: jest.fn().mockReturnValue({}),
}));

const EXPRESS_CONTEXT = {
  req: { headers: { cookie: '' } },
  res: {},
} as ExpressContext;

const db = createDb();
const createRequestContext = getRequestContextCreator(db);

afterEach(() => {
  jest.clearAllMocks();
});

test('uses getCookies', async (done) => {
  const userSessionToken = 'foo-token';
  const cookies = { USER_SESSION_TOKEN: userSessionToken };
  (getCookies as jest.Mock).mockReturnValueOnce(cookies);

  const ctx = await createRequestContext(EXPRESS_CONTEXT);

  expect(getCookies).toBeCalledTimes(1);
  expect(ctx.cookies).toStrictEqual(cookies);
  expect(ctx.auth.token).toBe(userSessionToken);
  done();
});

test('handles getAuthenticatedUser returns a user', async (done) => {
  const user = Symbol('user');
  (getAuthenticatedUser as jest.Mock).mockReturnValueOnce(user);

  const ctx = await createRequestContext(EXPRESS_CONTEXT);

  expect(getAuthenticatedUser).toBeCalledTimes(1);
  expect(ctx.auth.user).toBe(user);
  expect(ctx.auth.isLoggedIn).toBe(true);
  done();
});

test('handles getAuthenticatedUser returns null', async (done) => {
  (getAuthenticatedUser as jest.Mock).mockReturnValueOnce(null);

  const ctx = await createRequestContext(EXPRESS_CONTEXT);

  expect(getAuthenticatedUser).toBeCalledTimes(1);
  expect(ctx.auth.user).toBeNull();
  expect(ctx.auth.isLoggedIn).toBe(false);
  done();
});

test('uses createDataLoaders', async (done) => {
  const dataLoaders = Symbol('data-loaders');
  (createDataLoaders as jest.Mock).mockReturnValueOnce(dataLoaders);

  const ctx = await createRequestContext(EXPRESS_CONTEXT);

  expect(ctx.dataLoaders).toBe(dataLoaders);
  done();
});
