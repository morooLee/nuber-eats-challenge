import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  GetReviewInput,
  GetReviewOutput,
} from 'src/reviews/dtos/get-review.dto';
import { GetReviewsOutput } from 'src/reviews/dtos/get-reviews.dto';
import { Review } from 'src/reviews/entities/review.entity';
import { PodcastsService } from 'src/podcasts/podcasts.service';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import {
  CreateReviewInput,
  CreateReviewOutput,
} from './dtos/create-review.dto';
import {
  DeleteReviewInput,
  DeleteReviewOutput,
} from './dtos/delete-review.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private readonly reviews: Repository<Review>,
    private readonly usersService: UsersService,
    private readonly podcastsService: PodcastsService,
  ) {}

  async createReview(
    user: User,
    { podcast, content }: CreateReviewInput,
  ): Promise<CreateReviewOutput> {
    try {
      const findUserResult = await this.usersService.findById(user.id);
      if (!findUserResult.ok) {
        return findUserResult;
      }
      const getPodcastResult = await this.podcastsService.getPodcast({
        id: podcast.id,
      });
      if (!getPodcastResult.ok) {
        return getPodcastResult;
      }

      let review = await this.reviews.create({ user, podcast, content });
      review = await this.reviews.save(review);

      return { ok: true, review };
    } catch (error) {
      return { ok: false, error };
    }
  }

  async getReviews(userId: number): Promise<GetReviewsOutput> {
    try {
      const findUserResult = await this.usersService.findById(userId);
      if (!findUserResult.ok) {
        return findUserResult;
      }
      const reviews = await this.reviews.find({ where: { userId } });

      return { ok: true, reviews };
    } catch (error) {
      return { ok: false, error };
    }
  }

  async getReview({ reviewId }: GetReviewInput): Promise<GetReviewOutput> {
    try {
      const review = await this.reviews.findOne(reviewId);

      if (!review) {
        return { ok: false, error: `Review Id ${reviewId} not found.` };
      }

      return { ok: true, review };
    } catch (error) {
      return { ok: false, error };
    }
  }
  async deleteReview(
    userId: number,
    { reviewId }: DeleteReviewInput,
  ): Promise<DeleteReviewOutput> {
    try {
      const getReviewResult = await this.getReview({ reviewId });
      if (!getReviewResult.ok) {
        return getReviewResult;
      }

      if (getReviewResult.review.user.id !== userId) {
        return { ok: false, error: 'Users are not authors.' };
      }

      await this.reviews.delete(reviewId);

      return { ok: true };
    } catch (error) {
      return { ok: false, error };
    }
  }
}
