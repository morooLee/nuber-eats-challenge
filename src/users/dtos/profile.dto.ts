import { Field, ObjectType, OmitType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { User } from '../entities/user.entity';

@ObjectType()
export class ProfileOutput extends CoreOutput {
  @Field(() => User, { nullable: true })
  user?: User;
}
