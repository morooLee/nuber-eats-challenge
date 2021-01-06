import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsArray, IsNumber, IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Episode } from './episode.entity';

@InputType('PodcastInputType', { isAbstract: true })
@ObjectType()
export class Podcast extends CoreEntity {
  @Field(() => String)
  @IsString()
  title: string;

  @Field(() => String)
  @IsString()
  category: string;

  @Field(() => Number)
  @IsNumber()
  rating: number;

  @Field(() => [Episode])
  @IsArray()
  episodes: Episode[];
}
