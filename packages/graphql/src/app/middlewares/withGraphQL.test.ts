import { useTestContainer } from '@stringsync/di';
import { withGraphQL } from './withGraphQL';
import { generateSchema } from '../../schema';

const container = useTestContainer();

it('runs without crashing', () => {
  const schema = generateSchema();
  expect(() => withGraphQL(container, schema)).not.toThrow();
});