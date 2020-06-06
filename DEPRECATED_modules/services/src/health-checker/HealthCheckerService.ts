import { Db } from '@stringsync/sequelize';
import { Redis } from 'ioredis';
import { inject, injectable } from 'inversify';
import { TYPES } from '@stringsync/container';

@injectable()
export class HealthCheckerService {
  readonly db: Db;
  readonly redis: Redis;

  constructor(@inject(TYPES.Db) db: Db, @inject(TYPES.Redis) redis: Redis) {
    this.db = db;
    this.redis = redis;
  }

  async checkHealth() {
    await this.db.sequelize.authenticate();
    await this.redis.time();
  }
}