import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import {
  CreateReviewInput,
  CreateReviewOutput,
} from 'src/reviews/dtos/create-review.dto';
import {
  DeleteReviewInput,
  DeleteReviewOutput,
} from 'src/reviews/dtos/delete-review.dto';
import {
  GetReviewInput,
  GetReviewOutput,
} from 'src/reviews/dtos/get-review.dto';
import { GetReviewsOutput } from 'src/reviews/dtos/get-reviews.dto';
import { Review } from 'src/reviews/entities/review.entity';
import { User } from 'src/users/entities/user.entity';
import { ReviewsService } from './reviews.service';

@Resolver(() => Review)
export class ReviewsResolver {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Role(['Any'])
  @Mutation(() => CreateReviewOutput)
  async createReview(
    @AuthUser() authUser: User,
    @Args('input') createReviewInput: CreateReviewInput,
  ): Promise<CreateReviewOutput> {
    return await this.reviewsService.createReview(authUser, createReviewInput);
  }

  @Role(['Any'])
  @Query(() => GetReviewsOutput)
  async getReviews(@AuthUser() authUser: User): Promise<GetReviewsOutput> {
    return await this.reviewsService.getReviews(authUser.id);
  }

  @Role(['Any'])
  @Query(() => GetReviewsOutput)
  async getReview(
    @Args('input') getReviewInput: GetReviewInput,
  ): Promise<GetReviewOutput> {
    return await this.reviewsService.getReview(getReviewInput);
  }

  @Role(['Any'])
  @Mutation(() => DeleteReviewOutput)
  async deleteReview(
    @AuthUser() authUser: User,
    @Args('input') deleteReviewInput: DeleteReviewInput,
  ): Promise<DeleteReviewOutput> {
    return await this.reviewsService.deleteReview(
      authUser.id,
      deleteReviewInput,
    );
  }
}
