import { AuthService } from './AuthService';
import { useTestContainer, TYPES } from '@stringsync/container';
import { UserRole, User } from '@stringsync/domain';
import { TestFactory, randStr, NotFoundError, BadRequestError } from '@stringsync/common';
import { UserRepo } from '@stringsync/repos';
import * as bcrypt from 'bcrypt';
import { isPlainObject } from 'lodash';

const container = useTestContainer();

let authService: AuthService;
let userRepo: UserRepo;

beforeEach(() => {
  authService = container.get<AuthService>(TYPES.AuthService);
  userRepo = authService.userRepo;
  userRepo.userLoader.startListeningForChanges();
});

afterEach(() => {
  userRepo.userLoader.stopListeningForChanges();
});

describe('getSessionUser', () => {
  it('returns a null session user when the id is empty', async () => {
    const sessionUser = await authService.getSessionUser('');

    expect(sessionUser).toStrictEqual({
      id: '',
      role: UserRole.STUDENT,
      isLoggedIn: false,
    });
  });

  it('returns a null session user when the id does not exist', async () => {
    const sessionUser = await authService.getSessionUser('');

    expect(sessionUser).toStrictEqual({
      id: '',
      role: UserRole.STUDENT,
      isLoggedIn: false,
    });
  });

  it('returns a session user when the id exists', async () => {
    const user = await authService.userRepo.create(TestFactory.buildRandUser());
    const sessionUser = await authService.getSessionUser(user.id);
    expect(sessionUser).toStrictEqual({
      id: user.id,
      role: user.role,
      isLoggedIn: true,
    });
  });
});

describe('toSessionUser', () => {
  it('converts a user to a session user', () => {
    const user = TestFactory.buildRandUser();
    const sessionUser = authService.toSessionUser(user);
    expect(sessionUser).toStrictEqual({
      id: user.id,
      role: user.role,
      isLoggedIn: true,
    });
  });

  it('converts null to a session user', () => {
    const sessionUser = authService.toSessionUser(null);
    expect(sessionUser).toStrictEqual({
      id: '',
      role: UserRole.STUDENT,
      isLoggedIn: false,
    });
  });
});

describe('whoami', () => {
  it('returns null when no id', async () => {
    const whoami = await authService.whoami('');
    expect(whoami).toBeNull();
  });

  it('returns the user matching the id', async () => {
    const user = await userRepo.create(TestFactory.buildRandUser());
    const whoami = await authService.whoami(user.id);
    expect(whoami).toStrictEqual(user);
  });

  it('returns null if a user does not match the id', async () => {
    const whoami = await authService.whoami(randStr(10));
    expect(whoami).toBeNull();
  });
});

describe('getAuthenticatedUser', () => {
  let password: string;
  let user: User;

  beforeEach(async () => {
    const username = randStr(10);
    const email = `${randStr(8)}@${randStr(8)}.com`;
    password = randStr(10);
    user = await authService.signup(username, email, password);
  });

  it('returns the user matching the username and password', async () => {
    const authenticatedUser = await authService.getAuthenticatedUser(user.username, password);
    expect(authenticatedUser).toStrictEqual(user);
  });

  it('returns the user matching the email and password', async () => {
    const authenticatedUser = await authService.getAuthenticatedUser(user.email, password);
    expect(authenticatedUser).toStrictEqual(user);
  });

  it('returns null if the username and password combo is wrong', async () => {
    const authenticatedUser = await authService.getAuthenticatedUser(user.username, randStr(11));
    expect(authenticatedUser).toBeNull();
  });

  it('returns null if the email and password combo is wrong', async () => {
    const authenticatedUser = await authService.getAuthenticatedUser(user.email, randStr(11));
    expect(authenticatedUser).toBeNull();
  });

  it('returns null if the username or email does not exist', async () => {
    const authenticatedUser = await authService.getAuthenticatedUser(randStr(10), password);
    expect(authenticatedUser).toBeNull();
  });
});

describe('signup', () => {
  let username: string;
  let email: string;
  let password: string;

  beforeEach(() => {
    username = randStr(10);
    email = `${randStr(8)}@${randStr(8)}.com`;
    password = randStr(10);
  });

  it('returns a user', async () => {
    const user = await authService.signup(username, email, password);
    expect(user.username).toBe(username);
    expect(user.email).toBe(email);
    await expect(bcrypt.compare(password, user.encryptedPassword)).resolves.toBe(true);
  });

  it('persists a user', async () => {
    const { id } = await authService.signup(username, email, password);
    const user = await userRepo.find(id);
    expect(user).not.toBeNull();
    expect(user!.id).toBe(id);
  });
});

describe('confirmEmail', () => {
  let user: User;
  let confirmedAt: Date;

  beforeEach(async () => {
    const username = randStr(10);
    const email = `${randStr(8)}@${randStr(8)}.com`;
    const password = randStr(10);
    user = await authService.signup(username, email, password);
    confirmedAt = new Date();
  });

  it('sets confirmed at', async () => {
    const confirmedEmailUser = await authService.confirmEmail(user.id, user.confirmationToken!, confirmedAt);

    expect(confirmedEmailUser.confirmedAt).toStrictEqual(confirmedAt);
    expect(confirmedEmailUser.confirmationToken).toBeNull();
  });

  it('persists confirmed at and unsets confirmation token', async () => {
    await authService.confirmEmail(user.id, user.confirmationToken!, confirmedAt);

    const foundUser = await userRepo.find(user.id);
    expect(foundUser).not.toBeNull();
    expect(foundUser!.confirmedAt).toStrictEqual(confirmedAt);
    expect(foundUser!.confirmationToken).toBeNull();
  });

  it('throws an error if user is not found', async () => {
    await expect(authService.confirmEmail(randStr(10), user.confirmationToken!, confirmedAt)).rejects.toThrowError(
      NotFoundError
    );
  });

  it('throws an error if user is already confirmed', async () => {
    await expect(authService.confirmEmail(user.id, user.confirmationToken!, confirmedAt)).resolves.not.toThrow();
    await expect(authService.confirmEmail(user.id, user.confirmationToken!, confirmedAt)).rejects.toThrowError(
      BadRequestError
    );
  });

  it('throws an error if no confirmationToken is provided', async () => {
    await expect(authService.confirmEmail(user.id, '', confirmedAt)).rejects.toThrowError(BadRequestError);
  });

  it('throws an error if the confirmationToken does not match', async () => {
    await expect(authService.confirmEmail(user.id, 'impossible-confirmation-token', confirmedAt)).rejects.toThrowError(
      BadRequestError
    );
  });
});

describe('resetConfirmationToken', () => {
  let user: User;

  beforeEach(async () => {
    const username = randStr(10);
    const email = `${randStr(8)}@${randStr(8)}.com`;
    const password = randStr(10);
    user = await authService.signup(username, email, password);
  });

  it('returns a user with a different confirmationToken', async () => {
    const resetConfirmationTokenUser = await authService.resetConfirmationToken(user.id);
    expect(resetConfirmationTokenUser).not.toBeNull();
    expect(resetConfirmationTokenUser!.confirmationToken).not.toStrictEqual(user.confirmationToken);
  });

  it('persists a user with a different confirmationToken', async () => {
    await authService.resetConfirmationToken(user.id);
    const foundUser = await userRepo.find(user.id);
    expect(foundUser).not.toBeNull();
    expect(foundUser!.confirmationToken).not.toBe(user.confirmationToken);
  });

  it('returns null when user does not exist', async () => {
    const resetConfirmationTokenUser = await authService.resetConfirmationToken(randStr(10));
    expect(resetConfirmationTokenUser).toBeNull();
  });

  it('returns null when user is already confirmed', async () => {
    await authService.confirmEmail(user.id, user.confirmationToken!, new Date());
    const resetConfirmationTokenUser = await authService.resetConfirmationToken(user.id);
    expect(resetConfirmationTokenUser).toBeNull();
  });
});

describe('reqPasswordReset', () => {
  let user: User;
  const reqAt = new Date();

  beforeEach(async () => {
    const username = randStr(10);
    const email = `${randStr(8)}@${randStr(8)}.com`;
    const password = randStr(10);
    user = await authService.signup(username, email, password);
  });

  it('sets a resetPasswordToken', async () => {
    const resetPasswordTokenUser = await authService.reqPasswordReset(user.email, reqAt);
    expect(resetPasswordTokenUser).not.toBeNull();
    expect(resetPasswordTokenUser!.resetPasswordToken).not.toBeNull();
    expect(resetPasswordTokenUser!.resetPasswordTokenSentAt).toBe(reqAt);
  });

  it('resets a resetPasswordToken', async () => {
    const resetPasswordTokenUser1 = await authService.reqPasswordReset(user.email, reqAt);
    const resetPasswordTokenUser2 = await authService.reqPasswordReset(user.email, reqAt);

    expect(resetPasswordTokenUser1).not.toBeNull();
    expect(resetPasswordTokenUser2).not.toBeNull();

    expect(resetPasswordTokenUser2!.resetPasswordToken).not.toBeNull();
    expect(resetPasswordTokenUser2!.resetPasswordToken).not.toBe(resetPasswordTokenUser1!.resetPasswordToken);
  });

  it('throws for an invalid email', async () => {
    await expect(authService.reqPasswordReset(randStr(10), reqAt)).rejects.toThrow();
  });

  it('returns a plain object', async () => {
    const resetPasswordTokenUser = await authService.reqPasswordReset(user.email, reqAt);
    expect(resetPasswordTokenUser).not.toBeNull();
    expect(isPlainObject(resetPasswordTokenUser)).toBe(true);
  });
});
