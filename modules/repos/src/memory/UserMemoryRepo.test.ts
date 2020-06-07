import { UserMemoryRepo } from './UserMemoryRepo';
import { testRepo, testUserRepo } from '../testing';
import { noop } from '@stringsync/common';
import { buildUser } from '@stringsync/domain';

testUserRepo({
  repoFactory: () => new UserMemoryRepo(),
  entityFactory: buildUser,
  cleanup: noop,
});
