import { isPlainObject, sortBy } from 'lodash';
import { container } from '../inversify.config';
import { EntityBuilder } from '../testing';
import { randStr } from '../util';
import { SequelizeTagRepo } from './sequelize';
import { TagRepo } from './types';

describe.each([['SequelizeTagRepo', SequelizeTagRepo]])('%s', (name, Ctor) => {
  const id = Symbol(name);
  let tagRepo: TagRepo;

  beforeAll(() => {
    container.bind<TagRepo>(id).to(Ctor);
  });

  beforeEach(() => {
    tagRepo = container.get<TagRepo>(id);
  });

  afterAll(() => {
    container.unbind(id);
  });

  describe('count', () => {
    it('returns the number of tags', async () => {
      await tagRepo.bulkCreate([
        EntityBuilder.buildRandTag(),
        EntityBuilder.buildRandTag(),
        EntityBuilder.buildRandTag(),
      ]);
      const count = await tagRepo.count();

      expect(count).toBe(3);
    });
  });

  describe('create', () => {
    it('creates a tag record', async () => {
      const countBefore = await tagRepo.count();
      await tagRepo.create(EntityBuilder.buildRandTag());
      const countAfter = await tagRepo.count();
      expect(countAfter).toBe(countBefore + 1);
    });

    it('creates a findable user record', async () => {
      const { id } = await tagRepo.create(EntityBuilder.buildRandTag());
      const tag = await tagRepo.find(id);

      expect(tag).not.toBeNull();
      expect(tag!.id).toBe(id);
    });

    it('returns a plain object', async () => {
      const tag = await tagRepo.create(EntityBuilder.buildRandTag());

      expect(isPlainObject(tag)).toBe(true);
    });

    it('disallows duplicate ids', async () => {
      const id = randStr(8);
      const tag = EntityBuilder.buildRandTag({ id });

      await expect(tagRepo.create(tag)).resolves.not.toThrow();
      await expect(tagRepo.create(tag)).rejects.toThrow();
    });
  });

  describe('find', () => {
    it('returns the tag matching the id', async () => {
      const id = randStr(8);
      await tagRepo.create(EntityBuilder.buildRandTag({ id }));

      const tag = await tagRepo.find(id);

      expect(tag).not.toBeNull();
      expect(tag!.id).toBe(id);
    });

    it('returns a plain object', async () => {
      const { id } = await tagRepo.create(EntityBuilder.buildRandTag());

      const tag = await tagRepo.find(id);

      expect(isPlainObject(tag)).toBe(true);
    });

    it('returns null when no tag found', async () => {
      const tag = await tagRepo.find('id');

      expect(tag).toBeNull();
    });
  });

  describe('findAll', () => {
    it('returns all tag records', async () => {
      const tags = [EntityBuilder.buildRandTag(), EntityBuilder.buildRandTag(), EntityBuilder.buildRandTag()];
      await tagRepo.bulkCreate(tags);

      const foundTags = await tagRepo.findAll();

      expect(sortBy(foundTags, 'id')).toStrictEqual(sortBy(tags, 'id'));
    });

    it('returns plain objects', async () => {
      const tags = [EntityBuilder.buildRandTag(), EntityBuilder.buildRandTag(), EntityBuilder.buildRandTag()];
      await tagRepo.bulkCreate(tags);

      const foundTags = await tagRepo.findAll();

      expect(foundTags.every(isPlainObject)).toBe(true);
    });
  });

  describe('update', () => {
    it('updates a tag', async () => {
      const tag = EntityBuilder.buildRandTag();
      await tagRepo.create(tag);
      const name = randStr(8);

      const updatedTag = await tagRepo.update(tag.id, { ...tag, name });

      expect(updatedTag.name).toBe(name);
    });

    it('returns plain objects', async () => {
      const tag = EntityBuilder.buildRandTag();
      await tagRepo.create(tag);
      const name = randStr(8);

      const updatedTag = await tagRepo.update(tag.id, { ...tag, name });

      expect(isPlainObject(updatedTag)).toBe(true);
    });
  });
});
