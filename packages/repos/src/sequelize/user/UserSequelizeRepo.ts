import { Connection, ConnectionArgs, NotFoundError, NotImplementedError } from '@stringsync/common';
import { UserModel } from '@stringsync/db';
import { TYPES } from '@stringsync/di';
import { User } from '@stringsync/domain';
import { inject, injectable } from 'inversify';
import { Op } from 'sequelize';
import { UserPager } from '../../pagers';
import { UserLoader, UserRepo } from '../../types';

@injectable()
export class UserSequelizeRepo implements UserRepo {
  userLoader: UserLoader;
  userPager: UserPager;

  constructor(@inject(TYPES.UserLoader) userLoader: UserLoader, @inject(TYPES.UserPager) userPager: UserPager) {
    this.userLoader = userLoader;
    this.userPager = userPager;
  }

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

  async findPage(connectionArgs: ConnectionArgs): Promise<Connection<User>> {
    throw new NotImplementedError();
  }
}
