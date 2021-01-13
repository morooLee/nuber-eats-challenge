import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Podcast } from 'src/podcasts/entities/podcast.entity';

@InputType()
export class GetPodcastInput extends PickType(Podcast, ['id']) {}

@ObjectType()
export class GetPodcastOutput extends CoreOutput {
  @Field(() => Podcast, { nullable: true })
  podcast?: Podcast;
}
