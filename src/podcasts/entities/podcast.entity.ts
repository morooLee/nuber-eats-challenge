import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsArray, IsNumber, IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Episode } from './episode.entity';

@Entity()
@InputType('PodcastInputType', { isAbstract: true })
@ObjectType()
export class Podcast extends CoreEntity {
  @Column()
  @Field(() => String)
  @IsString()
  title: string;

  @Column()
  @Field(() => String)
  @IsString()
  category: string;

  @Column()
  @Field(() => Number)
  @IsNumber()
  rating: number;

  @OneToMany(() => Episode, (episode) => episode.podcast, {
    onDelete: 'CASCADE',
  })
  @Field(() => [Episode])
  @IsArray()
  episodes: Episode[];
}
