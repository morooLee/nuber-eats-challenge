import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PodcastsService } from 'src/podcasts/podcasts.service';
import { Podcast } from 'src/podcasts/entities/podcast.entity';
import { Episode } from 'src/podcasts/entities/episode.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Podcast, Episode])],
  providers: [UsersService, UsersResolver, PodcastsService],
  exports: [UsersService],
})
export class UsersModule {}
