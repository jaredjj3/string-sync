import { DbAccessor } from '../types';

type ModelName = 'User' | 'UserSession';
const MODEL_CREATE_ORDER: ModelName[] = ['User', 'UserSession'];

interface FixtureMap {
  User?: any[];
  UserSession?: any[];
}

export const createFixtures: DbAccessor<void, FixtureMap> = async (
  db,
  transaction,
  fixtureMap
) => {
  for (const modelName of MODEL_CREATE_ORDER) {
    const fixtures = fixtureMap[modelName] || [];
    const Model = db.models[modelName];
    // TODO figure out type error
    await (Model as any).bulkCreate(fixtures, { transaction });
  }
};
