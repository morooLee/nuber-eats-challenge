import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Role } from 'src/auth/role.decorator';
import {
  CreateEpisodeInput,
  CreateEpisodeOutput,
} from './dtos/create-episode.dto';
import {
  CreatePodcastInput,
  CreatePodcastOutput,
} from './dtos/create-podcast.dto';
import {
  DeleteEpisodeInput,
  DeleteEpisodeOutput,
} from './dtos/delete-episode.dto';
import {
  DeletePodcastInput,
  DeletePodcastOutput,
} from './dtos/delete-podcast.dto';
import { GetEpisodeInput, GetEpisodeOutput } from './dtos/get-episode.dto';
import { GetEpisodesInput, GetEpisodesOutput } from './dtos/get-episodes.dto';
import { GetPodcastInput, GetPodcastOutput } from './dtos/get-podcast.dto';
import { GetPodcastsOutput } from './dtos/get-podcasts.dto';
import {
  UpdateEpisodeInput,
  UpdateEpisodeOutput,
} from './dtos/update-episode.dto';
import {
  UpdatePodcastInput,
  UpdatePodcastOutput,
} from './dtos/update-podcast.dto';
import { Podcast } from './entities/podcast.entity';
import { PodcastsService } from './podcasts.service';

@Resolver(() => Podcast)
export class PodcastsResolver {
  constructor(private readonly podcastsService: PodcastsService) {}

  @Role(['Any'])
  @Query(() => GetPodcastsOutput)
  async getPodcasts(): Promise<GetPodcastsOutput> {
    return await this.podcastsService.getPodcasts();
  }

  @Role(['Host'])
  @Mutation(() => CreatePodcastOutput)
  async createPodcast(
    @Args('input') createPodcastInput: CreatePodcastInput,
  ): Promise<CreatePodcastOutput> {
    return await this.podcastsService.createPodcast(createPodcastInput);
  }

  @Role(['Any'])
  @Query(() => GetPodcastOutput)
  async getPodcast(
    @Args('input') getPodcastInput: GetPodcastInput,
  ): Promise<GetPodcastOutput> {
    return await this.podcastsService.getPodcast(getPodcastInput);
  }

  @Role(['Host'])
  @Mutation(() => DeletePodcastOutput)
  async deletePodcast(
    @Args('input') deletePodcastInput: DeletePodcastInput,
  ): Promise<DeletePodcastOutput> {
    return await this.podcastsService.deletePodcast(deletePodcastInput);
  }

  @Role(['Host'])
  @Mutation(() => UpdatePodcastOutput)
  async updatePodcast(
    @Args('input') updatePodcastInput: UpdatePodcastInput,
  ): Promise<UpdatePodcastOutput> {
    return await this.podcastsService.updatePodcast(updatePodcastInput);
  }

  @Role(['Any'])
  @Query(() => GetEpisodesOutput)
  async getEpisodes(
    @Args('input') getEpisodesInput: GetEpisodesInput,
  ): Promise<GetEpisodesOutput> {
    return await this.podcastsService.getEpisodes(getEpisodesInput);
  }

  @Role(['Host'])
  @Mutation(() => CreateEpisodeOutput)
  async createEpisode(
    @Args('input') createEpisodeInput: CreateEpisodeInput,
  ): Promise<CreateEpisodeOutput> {
    return await this.podcastsService.createEpisode(createEpisodeInput);
  }

  @Role(['Host'])
  @Mutation(() => DeleteEpisodeOutput)
  async deleteEpisode(
    @Args('input') deleteEpisodeInput: DeleteEpisodeInput,
  ): Promise<DeleteEpisodeOutput> {
    return await this.podcastsService.deleteEpisode(deleteEpisodeInput);
  }

  @Role(['Any'])
  @Query(() => GetEpisodeOutput)
  async getEpisode(
    @Args('input') getEpisodeInput: GetEpisodeInput,
  ): Promise<GetEpisodeOutput> {
    return await this.podcastsService.getEpisode(getEpisodeInput);
  }

  @Role(['Host'])
  @Mutation(() => UpdateEpisodeOutput)
  async updateEpisode(
    @Args('input') updateEpisodeInput: UpdateEpisodeInput,
  ): Promise<UpdateEpisodeOutput> {
    return await this.podcastsService.updateEpisode(updateEpisodeInput);
  }
}
