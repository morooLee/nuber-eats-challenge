import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
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
  @Query(() => GetPodcastsOutput)
  getPodcasts(): Promise<GetPodcastsOutput> {
    return this.podcastsService.getPodcasts();
  }
  @Mutation(() => CreatePodcastOutput)
  createPodcast(
    @Args('input') createPodcastInput: CreatePodcastInput,
  ): Promise<CreatePodcastOutput> {
    return this.podcastsService.createPodcast(createPodcastInput);
  }
  @Query(() => GetPodcastOutput)
  getPodcast(
    @Args('input') getPodcastInput: GetPodcastInput,
  ): Promise<GetPodcastOutput> {
    return this.podcastsService.getPodcast(getPodcastInput);
  }
  @Mutation(() => DeletePodcastOutput)
  deletePodcast(
    @Args('input') deletePodcastInput: DeletePodcastInput,
  ): Promise<DeletePodcastOutput> {
    return this.podcastsService.deletePodcast(deletePodcastInput);
  }
  @Mutation(() => UpdatePodcastOutput)
  updatePodcast(
    @Args('input') updatePodcastInput: UpdatePodcastInput,
  ): Promise<UpdatePodcastOutput> {
    return this.podcastsService.updatePodcast(updatePodcastInput);
  }
  @Query(() => GetEpisodesOutput)
  getEpisodes(
    @Args('input') getEpisodesInput: GetEpisodesInput,
  ): Promise<GetEpisodesOutput> {
    return this.podcastsService.getEpisodes(getEpisodesInput);
  }
  @Mutation(() => CreateEpisodeOutput)
  createEpisode(
    @Args('input') createEpisodeInput: CreateEpisodeInput,
  ): Promise<CreateEpisodeOutput> {
    return this.podcastsService.createEpisode(createEpisodeInput);
  }
  @Mutation(() => DeleteEpisodeOutput)
  deleteEpisode(
    @Args('input') deleteEpisodeInput: DeleteEpisodeInput,
  ): Promise<DeleteEpisodeOutput> {
    return this.podcastsService.deleteEpisode(deleteEpisodeInput);
  }
  @Query(() => GetEpisodeOutput)
  getEpisode(
    @Args('input') getEpisodeInput: GetEpisodeInput,
  ): Promise<GetEpisodeOutput> {
    return this.podcastsService.getEpisode(getEpisodeInput);
  }
  @Mutation(() => UpdateEpisodeOutput)
  updateEpisode(
    @Args('input') updateEpisodeInput: UpdateEpisodeInput,
  ): Promise<UpdateEpisodeOutput> {
    return this.podcastsService.updateEpisode(updateEpisodeInput);
  }
}
