import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';

@InputType('EpisodeInputType', { isAbstract: true })
@ObjectType()
export class Episode extends CoreEntity {
  @Field(() => String)
  @IsString()
  title: string;

  @Field(() => String)
  @IsString()
  description: string;
}
