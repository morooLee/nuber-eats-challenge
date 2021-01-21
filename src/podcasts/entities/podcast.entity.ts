import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsArray, IsNumber, IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, JoinColumn, OneToMany } from 'typeorm';
import { Episode } from './episode.entity';
import { Review } from '../../reviews/entities/review.entity';

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

  @OneToMany(() => Review, (review) => review.podcast)
  @Field(() => [Review])
  @IsArray()
  reviews: Review[];

  @OneToMany(() => Episode, (episode) => episode.podcast, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @Field(() => [Episode])
  @IsArray()
  episodes: Episode[];
}
