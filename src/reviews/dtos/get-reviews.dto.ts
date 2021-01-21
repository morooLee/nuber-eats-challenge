import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Review } from '../entities/review.entity';

@InputType()
export class GetReviewsInput {
  @Field(() => Number)
  @IsNumber()
  userId: number;
}

@ObjectType()
export class GetReviewsOutput extends CoreOutput {
  @Field(() => [Review], { nullable: true })
  reviews?: Review[];
}
