import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsObject, IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Podcast } from './podcast.entity';

@Entity()
@InputType('EpisodeInputType', { isAbstract: true })
@ObjectType()
export class Episode extends CoreEntity {
  @Column()
  @Field(() => String)
  @IsString()
  title: string;

  @Column()
  @Field(() => String)
  @IsString()
  description: string;

  @ManyToOne(() => Podcast, (podcast) => podcast.episodes, {
    cascade: true,
  })
  @Field(() => Podcast)
  @IsObject()
  podcast: Podcast;
}
