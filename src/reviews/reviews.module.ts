import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from 'src/reviews/entities/review.entity';
import { PodcastsService } from 'src/podcasts/podcasts.service';
import { UsersService } from 'src/users/users.service';
import { ReviewsResolver } from './reviews.resolver';
import { ReviewsService } from './reviews.service';
import { Podcast } from 'src/podcasts/entities/podcast.entity';
import { Episode } from 'src/podcasts/entities/episode.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Podcast, Episode, User])],
  providers: [ReviewsResolver, ReviewsService, UsersService, PodcastsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
