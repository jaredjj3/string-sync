export interface ConnectionArgs {
  before?: string | null;
  after?: string | null;
  first?: number | null;
  last?: number | null;
}

export interface NotationConnectionArgs extends ConnectionArgs {
  query?: string | null;
  tagIds?: string[] | null;
}

export interface UserConnectionArgs extends ConnectionArgs {}

export enum PagingType {
  FORWARD,
  BACKWARD,
}

export interface PageInfo {
  startCursor: string | null;
  endCursor: string | null;
  hasPreviousPage: boolean | null;
  hasNextPage: boolean | null;
}

export interface Connection<T> {
  edges: Array<Edge<T>>;
  pageInfo: PageInfo;
}

export interface Edge<T> {
  node: T;
  cursor: string;
}

export type PagingMeta =
  | { pagingType: PagingType.FORWARD; after: string | null; first: number | null }
  | { pagingType: PagingType.BACKWARD; before: string | null; last: number | null };

export type PagingEntity = {
  cursor: number;
};

export type PagingCtx = {
  cursor: number;
  limit: number;
  pagingType: PagingType;
};

export type EntityFinderResults<T extends PagingEntity> = {
  entities: T[];
  min: number;
  max: number;
};

export type EntityFinder<T extends PagingEntity> = (pagingCtx: PagingCtx) => Promise<EntityFinderResults<T>>;
