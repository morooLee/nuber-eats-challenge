import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Podcast } from '../entities/podcast.entity';

@InputType()
export class DeletePodcastInput extends PickType(Podcast, ['id']) {}

@ObjectType()
export class DeletePodcastOutput extends CoreOutput {}
