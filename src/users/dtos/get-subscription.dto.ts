import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Podcast } from '../../podcasts/entities/podcast.entity';

@InputType()
export class GetSubscriptionInput {
  @Field(() => Number)
  @IsNumber()
  podcastId: number;
}

@ObjectType()
export class GetSubscriptionOutput extends CoreOutput {
  @Field(() => Podcast, { nullable: true })
  podcast?: Podcast;
}
