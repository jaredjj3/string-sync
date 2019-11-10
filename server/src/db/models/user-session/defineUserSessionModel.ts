import { DataTypes, Sequelize } from 'sequelize';
import { UserSessionModel } from './types';
import { StaticModel } from '../types';

export const defineUserSessionModel = (dbConnection: Sequelize) =>
  dbConnection.define(
    'UserSession',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      issuedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      token: {
        type: DataTypes.UUIDV4,
        allowNull: true, // db sets this field
      },
      userId: {
        type: DataTypes.TEXT,
        references: {
          model: 'User',
          key: 'id',
        },
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      underscored: true,
      tableName: 'user_sessions',
      timestamps: false,
    }
  ) as StaticModel<UserSessionModel>;