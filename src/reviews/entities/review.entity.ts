import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber, IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Podcast } from 'src/podcasts/entities/podcast.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
@InputType('ReviewInputType', { isAbstract: true })
@ObjectType()
export class Review extends CoreEntity {
  // @Column()
  // @Field(() => Number)
  // @IsNumber()
  // userId: number;

  // @Column()
  // @Field(() => Number)
  // @IsNumber()
  // podcastId: number;

  @ManyToOne(() => User, (user) => user.reviews)
  @Field(() => User)
  user: User;

  @ManyToOne(() => Podcast, (podcast) => podcast.reviews)
  @Field(() => Podcast)
  podcast: Podcast;

  @Column()
  @Field(() => String)
  @IsString()
  content: string;
}
