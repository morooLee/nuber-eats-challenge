import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Podcast } from '../entities/podcast.entity';

@ObjectType()
export class GetPodcastsOutput extends CoreOutput {
  @Field(() => [Podcast], { nullable: true })
  data?: Podcast[];
}
