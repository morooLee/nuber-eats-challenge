import {
  Field,
  InputType,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { User } from '../entities/user.entity';

@InputType()
export class UpdateProfileInput extends PartialType(
  PickType(User, ['email', 'password', 'role']),
) {}

@ObjectType()
export class UpdateProfileOutput extends CoreOutput {
  @Field(() => User, { nullable: true })
  user?: User;
}
