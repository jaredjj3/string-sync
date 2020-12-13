import { configureStore } from '@reduxjs/toolkit';
import { EntityBuilder } from '@stringsync/domain';
import { TagClient } from '../../clients';
import { getTags, tagSlice } from './tagSlice';

let tagClient: TagClient;

beforeEach(() => {
  tagClient = TagClient.create();
  jest.spyOn(TagClient, 'create').mockReturnValue(tagClient);
});

afterEach(() => {
  jest.clearAllMocks();
});

it('initializes state', () => {
  const store = configureStore({
    reducer: {
      tag: tagSlice.reducer,
    },
  });

  const { tag } = store.getState();
  expect(tag.errors).toStrictEqual([]);
  expect(tag.isPending).toBe(false);
  expect(tag.tags).toStrictEqual([]);
});

describe('getTags', () => {
  it('pending', () => {
    const store = configureStore({
      reducer: {
        tag: tagSlice.reducer,
      },
      preloadedState: {
        tag: {
          isPending: false,
          errors: ['error1', 'error2'],
        },
      },
    });

    store.dispatch(getTags.pending('requestId'));

    const { tag } = store.getState();
    expect(tag.isPending).toBe(true);
    expect(tag.errors).toHaveLength(0);
  });

  it('fulfilled', async () => {
    const store = configureStore({
      reducer: {
        tag: tagSlice.reducer,
      },
    });

    const tag1 = EntityBuilder.buildRandTag();
    const tag2 = EntityBuilder.buildRandTag();
    const tagsSpy = jest.spyOn(tagClient, 'tags');
    tagsSpy.mockResolvedValue({
      data: {
        tags: [tag1, tag2],
      },
    });

    await store.dispatch(getTags());

    const { tag } = store.getState();
    expect(tag.isPending).toBe(false);
    expect(tag.errors).toHaveLength(0);
    expect(tag.tags).toStrictEqual([tag1, tag2]);
  });
});
