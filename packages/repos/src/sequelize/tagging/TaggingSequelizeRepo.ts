import { NotFoundError } from '@stringsync/common';
import { TaggingModel } from '@stringsync/db';
import { injectable } from '@stringsync/di';
import { Tagging } from '@stringsync/domain';
import { TaggingRepo } from '../../types';

@injectable()
export class TaggingSequelizeRepo implements TaggingRepo {
  async count(): Promise<number> {
    return await TaggingModel.count();
  }

  async create(attrs: Partial<Tagging>): Promise<Tagging> {
    const taggingEntity = await TaggingModel.create(attrs);
    return taggingEntity.get({ plain: true }) as Tagging;
  }

  async find(id: string): Promise<Tagging | null> {
    return await TaggingModel.findByPk(id, { raw: true });
  }

  async bulkCreate(bulkAttrs: Partial<Tagging>[]): Promise<Tagging[]> {
    const taggingEntites = await TaggingModel.bulkCreate(bulkAttrs);
    return taggingEntites.map((tagEntity: TaggingModel) => tagEntity.get({ plain: true })) as Tagging[];
  }

  async update(id: string, attrs: Partial<Tagging>): Promise<Tagging> {
    const taggingEntity = await TaggingModel.findByPk(id);
    if (!taggingEntity) {
      throw new NotFoundError('tagging not found');
    }
    await taggingEntity.update(attrs);
    return taggingEntity.get({ plain: true });
  }
}
