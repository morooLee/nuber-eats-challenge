import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Podcast } from '../../podcasts/entities/podcast.entity';

@ObjectType()
export class GetSubscriptionsOutput extends CoreOutput {
  @Field(() => [Podcast], { nullable: true })
  podcasts?: Podcast[];
}
