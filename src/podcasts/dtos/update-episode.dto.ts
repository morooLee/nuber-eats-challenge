import {
  Field,
  InputType,
  ObjectType,
  OmitType,
  PartialType,
} from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Episode } from '../entities/episode.entity';

@InputType()
export class UpdateEpisodeInput extends PartialType(OmitType(Episode, ['id'])) {
  @Field(() => Number)
  @IsNumber()
  episodeId: number;

  @Field(() => Number)
  @IsNumber()
  podcastId: number;
}

@ObjectType()
export class UpdateEpisodeOutput extends CoreOutput {
  @Field(() => Episode, { nullable: true })
  episode?: Episode;
}
