import { Transaction, TransactionOptions } from 'sequelize';
import { Db } from '../../db';

export interface Tx {
  uuid: string;
  transaction: Transaction;
  commit: () => Promise<void>;
  rollback: () => Promise<void>;
  afterCommit(fn: (transaction: Transaction) => any): void;
}

interface TransactionObjForSequelizeArgs {
  transaction: Transaction | undefined;
}

export interface TxManager {
  db: Db;
  transaction: () => TransactionObjForSequelizeArgs;
  get: (uuid?: string) => Tx | undefined;
  begin: (parent?: Tx, options?: TransactionOptions) => Promise<Tx>;
}
