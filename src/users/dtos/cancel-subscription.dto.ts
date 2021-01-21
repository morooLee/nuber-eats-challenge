import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class CancelSubscriptionInput {
  @Field(() => Number)
  @IsNumber()
  podcastId: number;
}

@ObjectType()
export class CancelSubscriptionOutput extends CoreOutput {}
