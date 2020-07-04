import { TYPES } from '@stringsync/container';
import { injectable, inject } from 'inversify';
import { TagRepo } from '@stringsync/repos';
import { Tag } from '@stringsync/domain';

@injectable()
export class TagService {
  tagRepo: TagRepo;

  constructor(@inject(TYPES.TagRepo) tagRepo: TagRepo) {
    this.tagRepo = tagRepo;
  }

  async find(id: string): Promise<Tag | null> {
    return await this.tagRepo.find(id);
  }

  async findAll(): Promise<Tag[]> {
    return await this.tagRepo.findAll();
  }
}
