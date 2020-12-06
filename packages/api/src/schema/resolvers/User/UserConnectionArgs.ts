import { UserConnectionArgs as IUserConnectionArgs } from '@stringsync/common';
import { injectable } from '@stringsync/di';
import { ArgsType, Field } from 'type-graphql';

@ArgsType()
@injectable()
export class UserConnectionArgs implements IUserConnectionArgs {
  @Field({ nullable: true, description: 'paginate before opaque cursor' })
  before!: string;

  @Field({ nullable: true, description: 'paginate after opaque cursor' })
  after!: string;

  @Field({ nullable: true, description: 'paginate first' })
  first!: number;

  @Field({ nullable: true, description: 'paginate last' })
  last!: number;
}
