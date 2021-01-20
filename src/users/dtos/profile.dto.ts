import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { User } from '../entities/user.entity';

@ArgsType()
export class ProfileInput {
  @Field(() => Number)
  userId: number;
}

@ObjectType()
export class ProfileOutput extends CoreOutput {
  @Field(() => User, { nullable: true })
  user?: User;
}
