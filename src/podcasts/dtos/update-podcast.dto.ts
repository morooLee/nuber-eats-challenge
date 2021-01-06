import { Field, InputType, ObjectType, PartialType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Podcast } from '../entities/podcast.entity';

@InputType()
export class UpdatePodcastInput extends PartialType(Podcast) {
  @Field(() => Number)
  @IsNumber()
  id: number;
}

@ObjectType()
export class UpdatePodcastOutput extends CoreOutput {
  @Field(() => Podcast, { nullable: true })
  data?: Podcast;
}
