import { randStr } from '@stringsync/common';
import { Container, useTestContainer } from '@stringsync/di';
import { EntityBuilder, Notation, Tag, User } from '@stringsync/domain';
import { UserSequelizeRepo } from '@stringsync/repos';
import { first, isPlainObject, last, sortBy, take, times } from 'lodash';
import { REPOS } from '../../REPOS';
import { REPOS_TYPES } from '../../REPOS_TYPES';
import { TaggingRepo, TagRepo } from '../../types';
import { NotationSequelizeRepo } from './NotationSequelizeRepo';

const TYPES = { ...REPOS_TYPES };

const ref = useTestContainer(REPOS);

let container: Container;

let notationRepo: NotationSequelizeRepo;
let userRepo: UserSequelizeRepo;

let user: User;
let transcriberId: string;

beforeEach(() => {
  container = ref.container;
  container.rebind<NotationSequelizeRepo>(TYPES.NotationRepo).to(NotationSequelizeRepo);
});

beforeEach(async () => {
  notationRepo = container.get<NotationSequelizeRepo>(TYPES.NotationRepo);
  userRepo = container.get<UserSequelizeRepo>(TYPES.UserRepo);

  user = await userRepo.create(EntityBuilder.buildRandUser());
  transcriberId = user.id;
});

describe('count', () => {
  it('counts the number of notations', async () => {
    await notationRepo.bulkCreate([
      EntityBuilder.buildRandNotation({ transcriberId }),
      EntityBuilder.buildRandNotation({ transcriberId }),
      EntityBuilder.buildRandNotation({ transcriberId }),
    ]);

    const count = await notationRepo.count();

    expect(count).toBe(3);
  });
});

describe('find', () => {
  it('finds notations', async () => {
    const { id } = await notationRepo.create(EntityBuilder.buildRandNotation({ transcriberId }));
    const notation = await notationRepo.find(id);

    expect(notation).not.toBeNull();
  });

  it('returns null if notation is missing', async () => {
    const notation = await notationRepo.find(randStr(8));

    expect(notation).toBeNull();
  });

  it('returns a plain object', async () => {
    const { id } = await notationRepo.create(EntityBuilder.buildRandNotation({ transcriberId }));
    const notation = await notationRepo.find(id);

    expect(isPlainObject(notation)).toBe(true);
  });
});

describe('findAll', () => {
  it('finds all notations', async () => {
    const notations = await notationRepo.bulkCreate([
      EntityBuilder.buildRandNotation({ transcriberId }),
      EntityBuilder.buildRandNotation({ transcriberId }),
      EntityBuilder.buildRandNotation({ transcriberId }),
    ]);

    const foundNotations = await notationRepo.findAll();

    expect(sortBy(foundNotations, 'id')).toStrictEqual(sortBy(notations, 'id'));
  });

  it('returns plain objects', async () => {
    const notations = await notationRepo.bulkCreate([
      EntityBuilder.buildRandNotation({ transcriberId }),
      EntityBuilder.buildRandNotation({ transcriberId }),
      EntityBuilder.buildRandNotation({ transcriberId }),
    ]);

    const foundNotations = await notationRepo.findAll();

    expect(foundNotations.every(isPlainObject)).toBe(true);
  });
});

describe('create', () => {
  it('creates a notation', async () => {
    const beforeCount = await notationRepo.count();
    await notationRepo.create(EntityBuilder.buildRandNotation({ transcriberId }));
    const afterCount = await notationRepo.count();

    expect(afterCount).toBe(beforeCount + 1);
  });

  it('creates a queryable notation', async () => {
    const notation = await notationRepo.create(EntityBuilder.buildRandNotation({ transcriberId }));
    const foundNotation = await notationRepo.find(notation.id);

    expect(foundNotation).toStrictEqual(notation);
  });

  it('returns a plain object', async () => {
    const notation = await notationRepo.create(EntityBuilder.buildRandNotation({ transcriberId }));
    const foundNotation = await notationRepo.find(notation.id);

    expect(isPlainObject(foundNotation)).toBe(true);
  });

  it('disallows duplicate ids', async () => {
    const notation = EntityBuilder.buildRandNotation({ transcriberId });

    await expect(notationRepo.create(notation)).resolves.not.toThrow();
    await expect(notationRepo.create(notation)).rejects.toThrow();
  });
});

describe('bulkCreate', () => {
  it('creates many notations', async () => {
    const notations = await notationRepo.bulkCreate([
      EntityBuilder.buildRandNotation({ transcriberId }),
      EntityBuilder.buildRandNotation({ transcriberId }),
      EntityBuilder.buildRandNotation({ transcriberId }),
    ]);

    const foundNotations = await notationRepo.findAll();

    expect(sortBy(foundNotations, 'id')).toStrictEqual(sortBy(notations, 'id'));
  });

  it('returns plain objects', async () => {
    const notations = await notationRepo.bulkCreate([
      EntityBuilder.buildRandNotation({ transcriberId }),
      EntityBuilder.buildRandNotation({ transcriberId }),
      EntityBuilder.buildRandNotation({ transcriberId }),
    ]);

    expect(notations.every(isPlainObject)).toBe(true);
  });
});

describe('update', () => {
  it('updates a notation', async () => {
    const notation = await notationRepo.create(EntityBuilder.buildRandNotation({ transcriberId }));
    const songName = randStr(8);

    const updatedNotation = await notationRepo.update(notation.id, { songName });

    expect(updatedNotation.songName).toBe(songName);
  });

  it('returns plain objects', async () => {
    const notation = await notationRepo.create(EntityBuilder.buildRandNotation({ transcriberId }));
    const songName = randStr(8);

    const updatedNotation = await notationRepo.update(notation.id, { songName });

    expect(isPlainObject(updatedNotation)).toBe(true);
  });
});

describe('findPage', () => {
  const NUM_USERS = 2;
  const NUM_NOTATIONS = 11;

  let users: User[];
  let notations: Notation[];

  beforeEach(async () => {
    users = new Array(NUM_USERS);
    for (let ndx = 0; ndx < NUM_USERS; ndx++) {
      users[ndx] = EntityBuilder.buildRandUser({ cursor: ndx + 1 });
    }
    users = await userRepo.bulkCreate(users);

    notations = new Array(NUM_NOTATIONS);
    for (let ndx = 0; ndx < NUM_NOTATIONS; ndx++) {
      const transcriber = ndx % 2 === 0 ? users[0] : users[1];
      notations[ndx] = EntityBuilder.buildRandNotation({ cursor: ndx + 1, transcriberId: transcriber.id });
    }
    notations = await notationRepo.bulkCreate(notations);
  });

  it('returns the first PAGE_LIMIT records by default', async () => {
    const notationConnection = await notationRepo.findPage({});

    const actualNotations = notationConnection.edges.map((edge) => edge.node);
    const expectedNotations = take(
      sortBy(notations, (notation) => notation.cursor),
      10
    );

    expect(actualNotations).toHaveLength(10);
    expect(actualNotations).toStrictEqual(sortBy(expectedNotations, (notation) => notation.cursor));
  });

  it('returns the first N records', async () => {
    const notationConnection = await notationRepo.findPage({ first: 5 });

    const actualNotations = notationConnection.edges.map((edge) => edge.node);
    const expectedNotations = take(
      sortBy(notations, (notation) => notation.cursor),
      5
    );

    expect(actualNotations).toHaveLength(5);
    expect(actualNotations).toStrictEqual(expectedNotations);
  });

  it('returns the first N records after a cursor', async () => {
    const { pageInfo } = await notationRepo.findPage({ first: 1 });
    const notationConnection = await notationRepo.findPage({ first: 2, after: pageInfo.endCursor });

    const actualNotations = notationConnection.edges.map((edge) => edge.node);
    const expectedNotations = sortBy(notations, (notation) => notation.cursor).slice(1, 3);

    expect(actualNotations).toHaveLength(2);
    expect(actualNotations).toStrictEqual(expectedNotations);
  });

  it('returns the last N records', async () => {
    const notationConnection = await notationRepo.findPage({ last: 5 });

    const actualNotations = notationConnection.edges.map((edge) => edge.node);
    const expectedNotations = sortBy(notations, (notation) => notation.cursor).slice(NUM_NOTATIONS - 5);

    expect(actualNotations).toHaveLength(5);
    expect(actualNotations).toStrictEqual(expectedNotations);
  });

  it('returns the last N records before a cursor', async () => {
    const { pageInfo } = await notationRepo.findPage({ last: 1 });
    const notationConnection = await notationRepo.findPage({ last: 2, before: pageInfo.startCursor });

    const actualNotations = notationConnection.edges.map((edge) => edge.node);
    const expectedNotations = sortBy(notations, (notation) => notation.cursor).slice(
      NUM_NOTATIONS - 3,
      NUM_NOTATIONS - 1
    );

    expect(actualNotations).toHaveLength(2);
    expect(actualNotations).toStrictEqual(expectedNotations);
  });

  it('returns all records when limit is greater than the records', async () => {
    const limit = NUM_NOTATIONS + 1;
    const notationConnection = await notationRepo.findPage({ first: limit });

    const actualNotations = notationConnection.edges.map((edge) => edge.node);
    const expectedNotations = sortBy(notations, (notation) => notation.cursor);

    expect(actualNotations).toStrictEqual(expectedNotations);
  });

  it('returns all records when limit is greater than remaining records after a cursor', async () => {
    const { pageInfo } = await notationRepo.findPage({ first: 1 });
    const notationConnection = await notationRepo.findPage({ first: NUM_NOTATIONS + 1, after: pageInfo.endCursor });

    const actualNotations = notationConnection.edges.map((edge) => edge.node);
    const expectedNotations = sortBy(notations, (notation) => notation.cursor).slice(1);

    expect(actualNotations).toHaveLength(expectedNotations.length);
    expect(actualNotations).toStrictEqual(expectedNotations);
  });
});

describe('findPage', () => {
  let tagRepo: TagRepo;
  let taggingRepo: TaggingRepo;

  beforeEach(async () => {
    tagRepo = container.get<TagRepo>(TYPES.TagRepo);
    taggingRepo = container.get<TaggingRepo>(TYPES.TaggingRepo);
  });

  it('defaults to paging forward', async () => {
    const notations = await notationRepo.bulkCreate(
      times(11, (ndx) => EntityBuilder.buildRandNotation({ transcriberId, cursor: ndx + 1 }))
    );

    const { edges, pageInfo } = await notationRepo.findPage({});

    expect(edges).toHaveLength(10);
    expect(edges.map((edge) => edge.node)).toStrictEqual(take(notations, 10));
    expect(pageInfo.startCursor).toBe(first(edges)!.cursor);
    expect(pageInfo.endCursor).toBe(last(edges)!.cursor);
    expect(pageInfo.hasNextPage).toBe(true);
    expect(pageInfo.hasPreviousPage).toBe(false);
  });

  it('returns the first N notations', async () => {
    const notations = await notationRepo.bulkCreate([
      EntityBuilder.buildRandNotation({ transcriberId, cursor: 1 }),
      EntityBuilder.buildRandNotation({ transcriberId, cursor: 2 }),
    ]);

    const { edges } = await notationRepo.findPage({ first: 1 });

    expect(edges.map((edge) => edge.node)).toStrictEqual(notations.slice(0, 1));
  });

  it('returns the last N notations', async () => {
    const notations = await notationRepo.bulkCreate([
      EntityBuilder.buildRandNotation({ transcriberId, cursor: 1 }),
      EntityBuilder.buildRandNotation({ transcriberId, cursor: 2 }),
    ]);

    const { edges } = await notationRepo.findPage({ last: 1 });

    expect(edges.map((edge) => edge.node)).toStrictEqual(notations.slice(-1));
  });

  describe('with search parameters', () => {
    let user1: User;
    let user2: User;
    let user3: User;

    let notation1: Notation;
    let notation2: Notation;
    let notation3: Notation;

    let tag1: Tag;
    let tag2: Tag;
    let tag3: Tag;

    beforeEach(async () => {
      [user1, user2, user3] = await userRepo.bulkCreate([
        EntityBuilder.buildRandUser({ username: 'foo' }),
        EntityBuilder.buildRandUser({ username: 'bar' }),
        EntityBuilder.buildRandUser({ username: 'foobar' }),
      ]);

      [notation1, notation2, notation3] = await notationRepo.bulkCreate([
        EntityBuilder.buildRandNotation({
          songName: 'yikes',
          artistName: 'bach',
          transcriberId: user1.id,
          cursor: 1,
        }),
        EntityBuilder.buildRandNotation({
          songName: 'overnight',
          artistName: 'loony',
          transcriberId: user2.id,
          cursor: 2,
        }),
        EntityBuilder.buildRandNotation({
          songName: 'bull fighter',
          artistName: 'jean dawson',
          transcriberId: user3.id,
          cursor: 3,
        }),
      ]);

      [tag1, tag2, tag3] = await tagRepo.bulkCreate([
        EntityBuilder.buildRandTag(),
        EntityBuilder.buildRandTag(),
        EntityBuilder.buildRandTag(),
      ]);

      await taggingRepo.bulkCreate([
        EntityBuilder.buildRandTagging({ notationId: notation1.id, tagId: tag1.id }),
        EntityBuilder.buildRandTagging({ notationId: notation1.id, tagId: tag2.id }),
        EntityBuilder.buildRandTagging({ notationId: notation2.id, tagId: tag2.id }),
        EntityBuilder.buildRandTagging({ notationId: notation2.id, tagId: tag3.id }),
      ]);
    });

    it('returns notations that have a transcriber username matching query', async () => {
      const { edges, pageInfo } = await notationRepo.findPage({ first: 3, query: 'foo' });

      expect(edges).toHaveLength(2);
      expect(edges.map((edge) => edge.node)).toStrictEqual([notation1, notation3]);
      expect(pageInfo.hasNextPage).toBe(false);
      expect(pageInfo.hasPreviousPage).toBe(false);
      expect(pageInfo.startCursor).toBe(first(edges)!.cursor);
      expect(pageInfo.endCursor).toBe(last(edges)!.cursor);
    });

    it('returns notations that have a song name matching query', async () => {
      const { edges, pageInfo } = await notationRepo.findPage({ first: 3, query: 'over' });

      expect(edges).toHaveLength(1);
      expect(edges.map((edge) => edge.node)).toStrictEqual([notation2]);
      expect(pageInfo.hasNextPage).toBe(false);
      expect(pageInfo.hasPreviousPage).toBe(false);
      expect(pageInfo.startCursor).toBe(first(edges)!.cursor);
      expect(pageInfo.endCursor).toBe(last(edges)!.cursor);
    });

    it('returns notations that have a artist name matching query', async () => {
      const { edges, pageInfo } = await notationRepo.findPage({ first: 3, query: 'daws' });

      expect(edges).toHaveLength(1);
      expect(edges.map((edge) => edge.node)).toStrictEqual([notation3]);
      expect(pageInfo.hasNextPage).toBe(false);
      expect(pageInfo.hasPreviousPage).toBe(false);
      expect(pageInfo.startCursor).toBe(first(edges)!.cursor);
      expect(pageInfo.endCursor).toBe(last(edges)!.cursor);
    });

    it('returns notations that have a tagId', async () => {
      const { edges, pageInfo } = await notationRepo.findPage({ first: 3, tagIds: [tag2.id] });

      expect(edges).toHaveLength(2);
      expect(edges.map((edge) => edge.node)).toStrictEqual([notation1, notation2]);
      expect(pageInfo.hasNextPage).toBe(false);
      expect(pageInfo.hasPreviousPage).toBe(false);
      expect(pageInfo.startCursor).toBe(first(edges)!.cursor);
    });

    it('returns notations that have all tagIds', async () => {
      const { edges, pageInfo } = await notationRepo.findPage({ first: 3, tagIds: [tag1.id, tag2.id] });

      expect(edges).toHaveLength(1);
      expect(edges.map((edge) => edge.node)).toStrictEqual([notation1]);
      expect(pageInfo.hasNextPage).toBe(false);
      expect(pageInfo.hasPreviousPage).toBe(false);
      expect(pageInfo.startCursor).toBe(first(edges)!.cursor);
    });

    it('returns notations that have all tagIds', async () => {
      const { edges, pageInfo } = await notationRepo.findPage({ first: 3, tagIds: [tag1.id, tag2.id] });

      expect(edges).toHaveLength(1);
      expect(edges.map((edge) => edge.node)).toStrictEqual([notation1]);
      expect(pageInfo.hasNextPage).toBe(false);
      expect(pageInfo.hasPreviousPage).toBe(false);
      expect(pageInfo.startCursor).toBe(first(edges)!.cursor);
    });
  });
});
