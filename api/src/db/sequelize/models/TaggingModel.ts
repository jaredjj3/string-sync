/* eslint-disable @typescript-eslint/member-ordering */
import { Association, BelongsToGetAssociationMixin, DataTypes, Model, Sequelize } from 'sequelize';
import { Tagging } from '../../../domain';
import { NotationModel } from './NotationModel';
import { TagModel } from './TagModel';

export class TaggingModel extends Model<Tagging, Partial<Tagging>> implements Tagging {
  static initColumns(sequelize: Sequelize) {
    TaggingModel.init(
      {
        id: {
          type: DataTypes.TEXT,
          primaryKey: true,
          allowNull: false,
          unique: true,
        },
        notationId: {
          type: DataTypes.TEXT,
          allowNull: false,
          references: {
            model: 'notations',
            key: 'id',
          },
        },
        tagId: {
          type: DataTypes.TEXT,
          allowNull: false,
          references: {
            model: 'tags',
            key: 'id',
          },
        },
      } as any,
      {
        sequelize,
        tableName: 'taggings',
        modelName: 'tagging',
        timestamps: false,
        underscored: true,
      }
    );
  }

  static initAssociations() {
    TaggingModel.belongsTo(TagModel, { foreignKey: 'tagId', as: 'tag' });
    TaggingModel.belongsTo(NotationModel, { foreignKey: 'notationId', as: 'notation' });
  }

  static associations: {
    tag: Association<TaggingModel, TagModel>;
    notation: Association<TaggingModel, NotationModel>;
  };

  getTag!: BelongsToGetAssociationMixin<TagModel>;
  getNotation!: BelongsToGetAssociationMixin<NotationModel>;

  tag?: TagModel;
  notation?: NotationModel;

  id!: string;
  notationId!: string;
  tagId!: string;
}
