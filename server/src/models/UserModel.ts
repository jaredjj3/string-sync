import { Model, DataTypes, BuildOptions } from 'sequelize';
import db from '../util/db';

export interface UserModel extends Model {
  id: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  username: string;
  email: string;
  encryptedPassword: string;
}

export type UserModelStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): UserModel;
};

export const UserModel = <UserModelStatic>db.define(
  'User',
  {
    id: {
      field: 'id',
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    createdAt: {
      field: 'created_at',
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
      },
    },
    updatedAt: {
      field: 'updated_at',
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
      },
    },
    username: {
      field: 'username',
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [3, 36],
      },
    },
    email: {
      field: 'email',
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [3, 36],
        isEmail: true,
      },
    },
    encryptedPassword: {
      field: 'encrypted_password',
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: 'users',
  }
);