import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsArray, IsEmail, IsEnum, IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import { Podcast } from 'src/podcasts/entities/podcast.entity';
import { Episode } from 'src/podcasts/entities/episode.entity';
import { Review } from 'src/reviews/entities/review.entity';

// type UserRole = 'user' | 'podcast';

export enum UserRole {
  Host = 'Host',
  Listener = 'Listener',
}
registerEnumType(UserRole, { name: 'UserRole' });

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Column()
  @Field(() => String)
  @IsEmail()
  email: string;

  @Column()
  @Field(() => String)
  @IsString()
  password: string;

  @Column({ type: 'simple-enum', enum: UserRole })
  @Field(() => UserRole)
  @IsEnum(UserRole)
  role: UserRole;

  @OneToMany(() => Podcast, (podcast) => podcast.id)
  @Field(() => [Podcast])
  @IsArray()
  subscribePodcasts: Podcast[];

  @OneToMany(() => Episode, (episode) => episode.id)
  @Field(() => [Episode])
  @IsArray()
  playedEpisodes: Episode[];

  @OneToMany(() => Review, (review) => review.user)
  @Field(() => [Review])
  @IsArray()
  reviews: Review[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    try {
      this.password = await bcrypt.hash(this.password, 10);
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }

  async checkPassword(password: string): Promise<boolean> {
    try {
      const result = await bcrypt.compare(password, this.password);
      return result;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }
}
