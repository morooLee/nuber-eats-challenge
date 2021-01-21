import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { SignInInput, SignInOutput } from './dtos/sign-in.dto';
import { ProfileInput, ProfileOutput } from './dtos/profile.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import {
  UpdateProfileInput,
  UpdateProfileOutput,
} from './dtos/update-profile.dto';
import { Role } from 'src/auth/role.decorator';
import {
  SubscribeToPodcastInput,
  SubscribeToPodcastOutput,
} from 'src/users/dtos/subscribe-podcast.dto';
import { GetSubscriptionsOutput } from 'src/users/dtos/get-subscriptions.dto';
import {
  GetSubscriptionInput,
  GetSubscriptionOutput,
} from './dtos/get-subscription.dto';
import {
  CancelSubscriptionInput,
  CancelSubscriptionOutput,
} from './dtos/cancel-subscription.dto';
import {
  AddPlayedEpisodeInput,
  AddPlayedEpisodeOutput,
} from './dtos/add-playedEpisode.dto';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Role(['Any'])
  @Query(() => User)
  me(@AuthUser() authUser: User) {
    return authUser;
  }

  @Mutation(() => CreateAccountOutput)
  async createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    return await this.usersService.createAccount(createAccountInput);
  }

  @Mutation(() => SignInOutput)
  async signIn(@Args('input') signInInput: SignInInput): Promise<SignInOutput> {
    return await this.usersService.signIn(signInInput);
  }

  @Role(['Any'])
  @Query(() => ProfileOutput)
  async profile(@Args() profileInput: ProfileInput): Promise<ProfileOutput> {
    return await this.usersService.findById(profileInput.userId);
  }

  @Role(['Any'])
  @Mutation(() => UpdateProfileOutput)
  async updateProfile(
    @AuthUser() authUser: User,
    @Args('input') updateProfileInput: UpdateProfileInput,
  ): Promise<UpdateProfileOutput> {
    return await this.usersService.updateProfile(
      authUser.id,
      updateProfileInput,
    );
  }

  @Role(['Any'])
  @Mutation(() => SubscribeToPodcastOutput)
  async subscribeToPodcast(
    @AuthUser() authUser: User,
    @Args('input') subscribeToPodcastInput: SubscribeToPodcastInput,
  ): Promise<SubscribeToPodcastOutput> {
    return await this.usersService.subscribeToPodcast(
      authUser.id,
      subscribeToPodcastInput,
    );
  }

  @Role(['Any'])
  @Query(() => GetSubscriptionsOutput)
  async getSubscriptions(
    @AuthUser() authUser: User,
  ): Promise<GetSubscriptionsOutput> {
    return await this.usersService.getSubscriptions(authUser.id);
  }

  @Role(['Any'])
  @Query(() => GetSubscriptionOutput)
  async getSubscription(
    @AuthUser() authUser: User,
    @Args('input') getSubscriptionInput: GetSubscriptionInput,
  ): Promise<GetSubscriptionOutput> {
    return await this.usersService.getSubscription(
      authUser.id,
      getSubscriptionInput,
    );
  }

  @Role(['Any'])
  @Mutation(() => CancelSubscriptionOutput)
  async cancelSubscription(
    @AuthUser() authUser: User,
    @Args('input') cancelSubscriptionInput: CancelSubscriptionInput,
  ): Promise<CancelSubscriptionOutput> {
    return await this.usersService.cancelSubscription(
      authUser.id,
      cancelSubscriptionInput,
    );
  }

  @Role(['Any'])
  @Mutation(() => AddPlayedEpisodeOutput)
  async addPlayedEpisode(
    @AuthUser() authUser: User,
    @Args('input') addPlayedEpisodeInput: AddPlayedEpisodeInput,
  ): Promise<AddPlayedEpisodeOutput> {
    return await this.usersService.addPlayedEpisode(
      authUser.id,
      addPlayedEpisodeInput,
    );
  }
}
