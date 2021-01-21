import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class DeleteEpisodeInput {
  @Field(() => Number)
  @IsNumber()
  episodeId: number;
}

@ObjectType()
export class DeleteEpisodeOutput extends CoreOutput {}
