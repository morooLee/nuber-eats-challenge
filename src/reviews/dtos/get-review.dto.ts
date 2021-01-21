import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Review } from '../entities/review.entity';

@InputType()
export class GetReviewInput {
  @Field(() => Number)
  @IsNumber()
  reviewId: number;
}

@ObjectType()
export class GetReviewOutput extends CoreOutput {
  @Field(() => Review, { nullable: true })
  review?: Review;
}
