import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { SignInInput, SignInOutput } from './dtos/sign-in.dto';
import { User } from './entities/user.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { ProfileOutput } from './dtos/profile.dto';
import {
  UpdateProfileInput,
  UpdateProfileOutput,
} from './dtos/update-profile.dto';
import {
  SubscribeToPodcastInput,
  SubscribeToPodcastOutput,
} from 'src/users/dtos/subscribe-podcast.dto';
import { PodcastsService } from 'src/podcasts/podcasts.service';
import { GetSubscriptionsOutput } from './dtos/get-subscriptions.dto';
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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly podcastsService: PodcastsService,
    private readonly jwtService: JwtService,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const exists = await this.users.findOne({ email });
      if (exists) {
        return { ok: false, error: 'There is a user with that email alraedy.' };
      }
      let user = await this.users.create({ email, password, role });
      user = await this.users.save(user);
      return { ok: true, user };
    } catch (error) {
      return { ok: false, error };
    }
  }

  async signIn({ email, password }: SignInInput): Promise<SignInOutput> {
    try {
      const user = await this.users.findOne({ email });
      if (!user) {
        return { ok: false, error: 'User not found.' };
      }

      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return { ok: false, error: 'Wrong password.' };
      }

      const token = await this.jwtService.sign({ id: user.id });

      return { ok: true, token };
    } catch (error) {
      return { ok: false, error };
    }
  }

  async findById(id: number): Promise<ProfileOutput> {
    try {
      const user = await this.users.findOne({ id });

      if (!user) {
        return { ok: false, error: 'User not found.' };
      }
      return { ok: true, user };
    } catch (error) {
      return { ok: false, error };
    }
  }

  async updateProfile(
    userId: number,
    { email, password, role }: UpdateProfileInput,
  ): Promise<UpdateProfileOutput> {
    try {
      let user = await this.users.findOne(userId);
      if (!user) {
        return { ok: false, error: 'User not found.' };
      }

      if (email) {
        user.email = email;
      }
      if (password) {
        user.password = password;
      }
      if (role) {
        user.role = role;
      }

      user = await this.users.save(user);
      return {
        ok: true,
        user,
      };
    } catch (error) {
      return { ok: false, error };
    }
  }

  async subscribeToPodcast(
    userId: number,
    { podcastId }: SubscribeToPodcastInput,
  ): Promise<SubscribeToPodcastOutput> {
    try {
      const findUserResult = await this.findById(userId);
      if (!findUserResult.ok) {
        return findUserResult;
      }

      const getPodcastResult = await this.podcastsService.getPodcast({
        id: podcastId,
      });
      if (!getPodcastResult.ok) {
        return getPodcastResult;
      }

      const findAlreaySubscribed = findUserResult.user.subscribePodcasts.find(
        (podcast) => podcast.id === podcastId,
      );
      if (findAlreaySubscribed) {
        return { ok: false, error: 'Already subscribed.' };
      }

      await this.users.save({
        ...findUserResult.user,
        subscribePodcasts: [
          ...findUserResult.user.subscribePodcasts,
          getPodcastResult.podcast,
        ],
      });

      return { ok: true };
    } catch (error) {
      return { ok: false, error };
    }
  }

  async getSubscriptions(userId: number): Promise<GetSubscriptionsOutput> {
    try {
      const findUserResult = await this.findById(userId);
      if (!findUserResult.ok) {
        return findUserResult;
      }
      const podcasts = findUserResult.user.subscribePodcasts;

      return { ok: true, podcasts };
    } catch (error) {
      return { ok: false, error };
    }
  }

  async getSubscription(
    userId: number,
    { podcastId }: GetSubscriptionInput,
  ): Promise<GetSubscriptionOutput> {
    try {
      const findUserResult = await this.findById(userId);
      if (!findUserResult.ok) {
        return findUserResult;
      }

      const getPodcastResult = await this.podcastsService.getPodcast({
        id: podcastId,
      });
      if (!getPodcastResult.ok) {
        return getPodcastResult;
      }

      const findAlreaySubscribed = findUserResult.user.subscribePodcasts.find(
        (podcast) => podcast.id === podcastId,
      );
      if (!findAlreaySubscribed) {
        return { ok: false, error: 'User not subscribed.' };
      }

      return { ok: true, podcast: findAlreaySubscribed };
    } catch (error) {
      return { ok: false, error };
    }
  }

  async cancelSubscription(
    userId: number,
    { podcastId }: CancelSubscriptionInput,
  ): Promise<CancelSubscriptionOutput> {
    try {
      const findUserResult = await this.findById(userId);
      if (!findUserResult.ok) {
        return findUserResult;
      }

      const getPodcastResult = await this.podcastsService.getPodcast({
        id: podcastId,
      });
      if (!getPodcastResult.ok) {
        return getPodcastResult;
      }

      const findIndex = findUserResult.user.subscribePodcasts.findIndex(
        (podcast) => podcast.id === podcastId,
      );
      if (findIndex === -1) {
        return { ok: false, error: 'User not subscribed.' };
      }

      findUserResult.user.subscribePodcasts.splice(findIndex, 1);
      await this.users.save({
        ...findUserResult.user,
      });

      return { ok: true };
    } catch (error) {
      return { ok: false, error };
    }
  }

  async addPlayedEpisode(
    userId: number,
    { episodeId }: AddPlayedEpisodeInput,
  ): Promise<AddPlayedEpisodeOutput> {
    try {
      const findUserResult = await this.findById(userId);
      if (!findUserResult.ok) {
        return findUserResult;
      }

      const getEpisodeResult = await this.podcastsService.getEpisode({
        episodeId,
      });
      if (!getEpisodeResult.ok) {
        return getEpisodeResult;
      }

      const findAlreayPlayedEpisoe = findUserResult.user.playedEpisodes.find(
        (episode) => episode.id === episodeId,
      );
      if (findAlreayPlayedEpisoe) {
        return { ok: false, error: 'Already played.' };
      }

      await this.users.save({
        ...findUserResult.user,
        playedEpisodes: [
          ...findUserResult.user.playedEpisodes,
          getEpisodeResult.episode,
        ],
      });
      return { ok: true };
    } catch (error) {
      return { ok: false, error };
    }
  }
}
