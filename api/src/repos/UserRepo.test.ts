import { isPlainObject, sortBy, take } from 'lodash';
import * as uuid from 'uuid';
import { User } from '../domain';
import { container } from '../inversify.config';
import { TYPES } from '../inversify.constants';
import { buildRandUser } from '../testing';
import { ctor, randStr } from '../util';
import { SequelizeUserRepo } from './sequelize';
import { UserRepo } from './types';

const ORIGINAL_USER_REPO = ctor(container.get<UserRepo>(TYPES.UserRepo));

describe.each([['SequelizeUserRepo', SequelizeUserRepo]])('%s', (_, Ctor) => {
  let userRepo: UserRepo;

  beforeAll(() => {
    container.rebind<UserRepo>(TYPES.UserRepo).to(Ctor);
  });

  beforeEach(() => {
    userRepo = container.get<UserRepo>(TYPES.UserRepo);
  });

  afterAll(() => {
    container.rebind<UserRepo>(TYPES.UserRepo).to(ORIGINAL_USER_REPO);
  });

  describe('count', () => {
    it('counts the number of users', async () => {
      await userRepo.bulkCreate([buildRandUser(), buildRandUser(), buildRandUser()]);

      const count = await userRepo.count();

      expect(count).toBe(3);
    });
  });

  describe('validate', () => {
    it('permits valid users', async () => {
      const user = buildRandUser();
      await expect(userRepo.validate(user)).resolves.not.toThrow();
    });

    it.each(['valid@email.com', 'validemail@123.com'])('permits valid emails', async (email) => {
      const user = buildRandUser({ email });
      await expect(userRepo.validate(user)).resolves.not.toThrow();
    });

    it.each(['invalid_email', 'email@domain'])('disallows invalid emails', async (email) => {
      const user = buildRandUser({ email });
      await expect(userRepo.validate(user)).rejects.toThrow();
    });

    it.each(['username123', '_username_', '-_-Username-_-', 'valid.username', '---', '-___-'])(
      'permits valid usernames',
      async (username) => {
        const user = buildRandUser({ username });
        await expect(userRepo.validate(user)).resolves.not.toThrow();
      }
    );

    it.each([
      'no',
      'super_long_username_cmon_pick_something_reasonable',
      'invalid.username!',
      '(invalidusername)',
      '; ATTEMPTED SQL INJECTION',
      '<script>ATTEMPTED XSS</script>',
    ])('disallows invalid usernames', async (username) => {
      const user = buildRandUser({ username });
      await expect(userRepo.validate(user)).rejects.toThrow();
    });

    it('permits valid confirmation tokens', async () => {
      const user = buildRandUser({ confirmationToken: randStr(10) });
      await expect(userRepo.validate(user)).resolves.not.toThrow();
    });

    it('permits valid reset password tokens', async () => {
      const user = buildRandUser({ resetPasswordToken: uuid.v4() });
      await expect(userRepo.validate(user)).resolves.not.toThrow();
    });

    it('permits valid avatar urls', async () => {
      const user = buildRandUser({ avatarUrl: 'http://avatars.com/rasdfsdfdf' });
      await expect(userRepo.validate(user)).resolves.not.toThrow();
    });

    it('disallows invalid avatar urls', async () => {
      const user = buildRandUser({ avatarUrl: 'notagoodurl/asdfasd' });
      await expect(userRepo.validate(user)).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('creates a user record', async () => {
      const countBefore = await userRepo.count();
      await userRepo.create(buildRandUser());
      const countAfter = await userRepo.count();

      expect(countAfter).toBe(countBefore + 1);
    });

    it('creates a findable user record', async () => {
      const { id } = await userRepo.create(buildRandUser());
      const user = await userRepo.find(id);

      expect(user).not.toBeNull();
      expect(user!.id).toBe(id);
    });

    it('returns a plain object', async () => {
      const user = await userRepo.create(buildRandUser());

      expect(isPlainObject(user)).toBe(true);
    });

    it('disallows duplicate ids', async () => {
      const user = buildRandUser({ id: 'id' });

      await expect(userRepo.create(user)).resolves.not.toThrow();
      await expect(userRepo.create(user)).rejects.toThrow();
    });
  });

  describe('find', () => {
    it('returns the user matching the id', async () => {
      const id = randStr(8);
      await userRepo.create(buildRandUser({ id }));

      const user = await userRepo.find(id);

      expect(user).not.toBeNull();
      expect(user!.id).toBe(id);
    });

    it('returns a plain object', async () => {
      const { id } = await userRepo.create(buildRandUser());

      const user = await userRepo.find(id);

      expect(isPlainObject(user)).toBe(true);
    });

    it('returns null when no user found', async () => {
      const user = await userRepo.find('id');

      expect(user).toBeNull();
    });
  });

  describe('findAll', () => {
    it('returns all user records', async () => {
      const users = [buildRandUser(), buildRandUser(), buildRandUser()];
      await userRepo.bulkCreate(users);

      const foundUsers = await userRepo.findAll();

      expect(sortBy(foundUsers, 'id')).toStrictEqual(sortBy(users, 'id'));
    });

    it('returns plain objects', async () => {
      const users = [buildRandUser(), buildRandUser(), buildRandUser()];
      await userRepo.bulkCreate(users);

      const foundUsers = await userRepo.findAll();

      expect(foundUsers.every(isPlainObject)).toBe(true);
    });
  });

  describe('findByUsernameOrEmail', () => {
    it('finds by username', async () => {
      const user = buildRandUser();
      await userRepo.create(user);

      const foundUser = await userRepo.findByUsernameOrEmail(user.username);

      expect(foundUser).not.toBeNull();
      expect(foundUser!.id).toBe(user.id);
    });

    it('finds by email', async () => {
      const user = buildRandUser();
      await userRepo.create(user);

      const foundUser = await userRepo.findByUsernameOrEmail(user.email);

      expect(foundUser).not.toBeNull();
      expect(foundUser!.id).toBe(user.id);
    });

    it('returns a plain object', async () => {
      const user = buildRandUser();
      await userRepo.create(user);

      const foundUser = await userRepo.findByUsernameOrEmail(user.username);

      expect(isPlainObject(foundUser)).toBe(true);
    });
  });

  describe('findByEmail', () => {
    it('finds by email', async () => {
      const user = buildRandUser();
      await userRepo.create(user);

      const foundUser = await userRepo.findByEmail(user.email);

      expect(foundUser).not.toBeNull();
      expect(foundUser!.id).toBe(user.id);
    });

    it('returns a plain object', async () => {
      const user = buildRandUser();
      await userRepo.create(user);

      const foundUser = await userRepo.findByEmail(user.email);

      expect(isPlainObject(foundUser)).toBe(true);
    });
  });

  describe('findByResetPasswordToken', () => {
    it('finds by resetPasswordToken', async () => {
      const resetPasswordToken = uuid.v4();
      const user = buildRandUser({ resetPasswordToken });
      await userRepo.create(user);

      const foundUser = await userRepo.findByResetPasswordToken(resetPasswordToken);

      expect(foundUser).not.toBeNull();
      expect(foundUser!.id).toBe(user.id);
    });

    it('returns a plain object', async () => {
      const resetPasswordToken = uuid.v4();
      const user = buildRandUser({ resetPasswordToken });
      await userRepo.create(user);

      const foundUser = await userRepo.findByResetPasswordToken(resetPasswordToken);

      expect(isPlainObject(foundUser)).toBe(true);
    });
  });

  describe('update', () => {
    it('updates a user', async () => {
      const user = await userRepo.create(buildRandUser());
      const username = randStr(8);

      const updatedUser = await userRepo.update(user.id, { username });

      expect(updatedUser.username).toBe(username);
    });

    it('returns plain objects', async () => {
      const user = await userRepo.create(buildRandUser());
      const username = randStr(8);

      const updatedUser = await userRepo.update(user.id, { username });

      expect(updatedUser.username).toBe(username);
    });

    it('unsets confirmationToken when updating email', async () => {
      const confirmationToken = uuid.v4();
      const user = await userRepo.create(buildRandUser({ confirmationToken }));

      const email = `${randStr(8)}@example.com`;
      const updatedUser = await userRepo.update(user.id, { email });

      expect(updatedUser.email).toBe(email);
      expect(updatedUser.confirmationToken).toBeNull();
      expect(updatedUser.confirmedAt).toBeNull();
    });

    it('unsets confirmedAt when updating email', async () => {
      const confirmedAt = new Date();
      const user = await userRepo.create(buildRandUser({ confirmedAt }));

      const email = `${randStr(8)}@example.com`;
      const updatedUser = await userRepo.update(user.id, { email });

      expect(updatedUser.email).toBe(email);
      expect(updatedUser.confirmationToken).toBeNull();
      expect(updatedUser.confirmedAt).toBeNull();
    });
  });

  describe('findPage', () => {
    const NUM_USERS = 21;

    let users: User[];

    beforeEach(async () => {
      users = new Array(NUM_USERS);
      for (let ndx = 0; ndx < NUM_USERS; ndx++) {
        users[ndx] = buildRandUser({ cursor: ndx + 1 });
      }
      users = await userRepo.bulkCreate(users);
    });

    it('returns the first 20 records by default', async () => {
      const userConnection = await userRepo.findPage({});

      const actualUsers = userConnection.edges.map((edge) => edge.node);
      const expectedUsers = take(sortBy(users, 'cursor'), 20);

      expect(actualUsers).toHaveLength(20);
      expect(actualUsers).toIncludeSameMembers(expectedUsers);
    });

    it('returns the first N records by reverse cursor', async () => {
      const userConnection = await userRepo.findPage({ first: 5 });

      const actualUsers = userConnection.edges.map((edge) => edge.node);
      const expectedUsers = take(sortBy(users, 'cursor'), 5);

      expect(actualUsers).toHaveLength(5);
      expect(actualUsers).toStrictEqual(expectedUsers);
    });

    it('returns the first N records after a cursor', async () => {
      const { pageInfo } = await userRepo.findPage({ first: 1 });
      const userConnection = await userRepo.findPage({ first: 2, after: pageInfo.endCursor });

      const actualUsers = userConnection.edges.map((edge) => edge.node);
      const expectedUsers = take(sortBy(users, 'cursor').slice(1), 2);

      expect(actualUsers).toHaveLength(2);
      expect(actualUsers).toStrictEqual(expectedUsers);
    });

    it('returns all records when limit is greater than the records', async () => {
      const limit = NUM_USERS + 1;
      const userConnection = await userRepo.findPage({ first: limit });

      const actualUsers = userConnection.edges.map((edge) => edge.node);
      const expectedUsers = sortBy(users, 'cursor');

      expect(actualUsers).toStrictEqual(expectedUsers);
    });

    it('returns all records when limit is greater than remaining records after a cursor', async () => {
      const { pageInfo } = await userRepo.findPage({ first: 1 });
      const userConnection = await userRepo.findPage({ first: NUM_USERS + 1, after: pageInfo.endCursor });

      const actualUsers = userConnection.edges.map((edge) => edge.node);
      const expectedUsers = sortBy(users, 'cursor').slice(1);

      expect(actualUsers).toHaveLength(expectedUsers.length);
      expect(actualUsers).toStrictEqual(expectedUsers);
    });
  });
});
