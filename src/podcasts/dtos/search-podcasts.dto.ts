import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Podcast } from '../entities/podcast.entity';

@InputType()
export class SearchPodcastsInput {
  @Field(() => String)
  @IsString()
  search: string;
}

@ObjectType()
export class SearchPodcastsOutput extends CoreOutput {
  @Field(() => [Podcast], { nullable: true })
  podcasts?: Podcast[];
}
