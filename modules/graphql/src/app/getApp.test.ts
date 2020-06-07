import { getApp } from './getApp';
import { Container } from 'inversify';
import { createContainer, cleanupContainer } from '@stringsync/container';

let container: Container;

beforeEach(async () => {
  container = await createContainer();
});

afterEach(async () => {
  await cleanupContainer(container);
});

it('runs without crashing', () => {
  expect(() => getApp(container)).not.toThrow();
});
