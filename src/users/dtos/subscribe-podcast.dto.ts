import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class SubscribeToPodcastInput {
  @Field(() => Number)
  @IsNumber()
  podcastId: number;
}

@ObjectType()
export class SubscribeToPodcastOutput extends CoreOutput {}
