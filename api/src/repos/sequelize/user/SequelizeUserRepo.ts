import { inject, injectable } from 'inversify';
import { Op } from 'sequelize';
import { UserModel } from '../../../db';
import { User } from '../../../domain';
import { NotFoundError } from '../../../errors';
import { TYPES } from '../../../inversify.constants';
import { Connection, Pager, PagingCtx, PagingType, UserConnectionArgs } from '../../../util';
import { UserLoader, UserRepo } from '../../types';

@injectable()
export class SequelizeUserRepo implements UserRepo {
  static pager = new Pager<User>(20, 'user');

  constructor(@inject(TYPES.UserLoader) public userLoader: UserLoader) {}

  async findByUsernameOrEmail(usernameOrEmail: string): Promise<User | null> {
    const username = usernameOrEmail;
    const email = usernameOrEmail;
    return await UserModel.findOne({
      where: { [Op.or]: [{ username }, { email }] } as any,
      raw: true,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await UserModel.findOne({
      where: { email },
      raw: true,
    });
  }

  async findByResetPasswordToken(resetPasswordToken: string): Promise<User | null> {
    return await UserModel.findOne({
      where: { resetPasswordToken },
      raw: true,
    });
  }

  async count(): Promise<number> {
    return await UserModel.count();
  }

  async validate(user: User): Promise<void> {
    await UserModel.build(user).validate();
  }

  async find(id: string): Promise<User | null> {
    return await this.userLoader.findById(id);
  }

  async findAll(): Promise<User[]> {
    return await UserModel.findAll({ order: [['cursor', 'DESC']], raw: true });
  }

  async create(attrs: Partial<User>): Promise<User> {
    const userModel = await UserModel.create(attrs, { raw: true });
    const user = userModel.get({ plain: true }) as User;
    return user;
  }

  async bulkCreate(bulkAttrs: Partial<User>[]): Promise<User[]> {
    const userModels: UserModel[] = await UserModel.bulkCreate(bulkAttrs);
    const users = userModels.map((userModel: UserModel) => userModel.get({ plain: true })) as User[];
    return users;
  }

  async update(id: string, attrs: Partial<User>): Promise<User> {
    const userEntity = await UserModel.findByPk(id);
    if (!userEntity) {
      throw new NotFoundError('user missing');
    }
    await userEntity.update(attrs);
    return userEntity.get({ plain: true });
  }

  async findPage(args: UserConnectionArgs): Promise<Connection<User>> {
    return await SequelizeUserRepo.pager.connect(args, async (pagingCtx: PagingCtx) => {
      const { cursor, limit, pagingType } = pagingCtx;

      const cmp = pagingType === PagingType.FORWARD ? Op.gt : Op.lt;

      const [entities, min, max] = await Promise.all([
        UserModel.findAll({
          where: {
            cursor: {
              [cmp]: cursor,
            },
          },
          order: [['cursor', pagingType === PagingType.FORWARD ? 'asc' : 'desc']],
          limit,
          raw: true,
        }),
        UserModel.min<number, UserModel>('cursor'),
        UserModel.max<number, UserModel>('cursor'),
      ]);

      if (pagingType === PagingType.BACKWARD) {
        entities.reverse();
      }

      return { entities, min, max };
    });
  }
}
