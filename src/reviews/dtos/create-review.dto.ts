import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Podcast } from 'src/podcasts/entities/podcast.entity';
import { Review } from '../entities/review.entity';

@InputType()
export class CreateReviewInput extends PickType(Review, ['content']) {
  @Field(() => Podcast)
  podcast: Podcast;
}

@ObjectType()
export class CreateReviewOutput extends CoreOutput {
  @Field(() => Review, { nullable: true })
  review?: Review;
}
