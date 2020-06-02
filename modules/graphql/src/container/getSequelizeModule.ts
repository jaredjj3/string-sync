import { ContainerModule } from 'inversify';
import { Config } from '../config';
import { TYPES } from '@stringsync/common';
import { connectToDb, Db } from '@stringsync/sequelize';

export const getSequelizeModule = (config: Config) =>
  new ContainerModule((bind) => {
    const db = connectToDb({
      databaseName: config.DB_NAME,
      host: config.DB_HOST,
      password: config.DB_PASSWORD,
      username: config.DB_NAME,
      port: parseInt(config.DB_PORT, 10),
      namespaceName: 'transaction',
    });
    bind<Db>(TYPES.Db).toConstantValue(db);
  });
