import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
import { Episode } from './entities/episode.entity';
import { Podcast } from './entities/podcast.entity';

@Injectable()
export class PodcastsService {
  constructor(
    @InjectRepository(Podcast) private readonly podcasts: Repository<Podcast>,
    @InjectRepository(Episode) private readonly episodes: Repository<Episode>,
  ) {}
  async getPodcasts(): Promise<GetPodcastsOutput> {
    try {
      const podcasts = await this.podcasts.find({ relations: ['episodes'] });
      return { ok: true, podcasts };
    } catch (error) {
      return { ok: false, error };
    }
  }
  async createPodcast(input: CreatePodcastInput): Promise<CreatePodcastOutput> {
    try {
      let podcast = await this.podcasts.create({
        ...input,
        rating: 0,
        episodes: [],
      });
      podcast = await this.podcasts.save(podcast);

      return { ok: true, podcast };
    } catch (error) {
      return { ok: false, error };
    }
  }
  async getPodcast({ id }: GetPodcastInput): Promise<GetPodcastOutput> {
    try {
      const podcast = await this.podcasts.findOne(id, {
        relations: ['episodes'],
      });
      if (!podcast) {
        return { ok: false, error: `Podcast with ID ${id} not found.` };
      }
      return { ok: true, podcast };
    } catch (error) {
      return { ok: false, error };
    }
  }
  async deletePodcast({
    id,
  }: DeletePodcastInput): Promise<DeletePodcastOutput> {
    try {
      const podcast = await this.podcasts.findOne(id, {
        relations: ['episodes'],
      });
      if (!podcast) {
        return { ok: false, error: `Podcast with ID ${id} not found.` };
      }
      for (const episode of podcast.episodes) {
        await this.episodes.delete(episode.id);
      }
      await this.podcasts.delete(id);
      return { ok: true };
    } catch (error) {
      return { ok: false, error };
    }
  }
  async updatePodcast(input: UpdatePodcastInput): Promise<UpdatePodcastOutput> {
    try {
      let podcast = await this.podcasts.findOne(input.id, {
        relations: ['episodes'],
      });
      if (!podcast) {
        return { ok: false, error: `Podcast with ID ${input.id} not found.` };
      }
      console.log(input);
      podcast = await this.podcasts.save({ ...podcast, ...input });
      return { ok: true, podcast };
    } catch (error) {
      return { ok: false, error };
    }
  }
  async getEpisodes({
    podcastId,
  }: GetEpisodesInput): Promise<GetEpisodesOutput> {
    try {
      const podcast = await this.podcasts.findOne(podcastId);
      if (!podcast) {
        return { ok: false, error: `Podcast with ID ${podcastId} not found.` };
      }
      const episodes = await this.episodes.find({ relations: ['podcast'] });
      return { ok: true, episodes };
    } catch (error) {
      return { ok: false, error };
    }
  }
  async createEpisode(input: CreateEpisodeInput): Promise<CreateEpisodeOutput> {
    try {
      const podcast = await this.podcasts.findOne(input.podcastId);
      if (!podcast) {
        return {
          ok: false,
          error: `Podcast with ID ${input.podcastId} not found.`,
        };
      }

      let episode = await this.episodes.create({
        title: input.title,
        description: input.description,
        podcast,
      });
      episode = await this.episodes.save(episode);

      return { ok: true, episode };
    } catch (error) {
      return { ok: false, error };
    }
  }
  async deleteEpisode({
    podcastId,
    episodeId,
  }: DeleteEpisodeInput): Promise<DeleteEpisodeOutput> {
    try {
      const podcast = await this.podcasts.findOne(podcastId);
      if (!podcast) {
        return {
          ok: false,
          error: `Podcast with ID ${podcastId} not found.`,
        };
      }
      const episode = await this.episodes.findOne(episodeId);
      if (!episode) {
        return {
          ok: false,
          error: `Episode with ID ${episodeId} not found.`,
        };
      }
      await this.episodes.delete(episodeId);
      return { ok: true };
    } catch (error) {
      return { ok: false, error };
    }
  }
  async getEpisode({
    podcastId,
    episodeId,
  }: GetEpisodeInput): Promise<GetEpisodeOutput> {
    try {
      const podcast = await this.podcasts.findOne(podcastId);
      if (!podcast) {
        return {
          ok: false,
          error: `Podcast with ID ${podcastId} not found.`,
        };
      }
      const episode = await this.episodes.findOne(episodeId, {
        relations: ['podcast'],
      });
      if (!episode) {
        return {
          ok: false,
          error: `Episode with ID ${episodeId} not found.`,
        };
      }
      return { ok: true, episode };
    } catch (error) {
      return { ok: false, error };
    }
  }
  async updateEpisode(input: UpdateEpisodeInput): Promise<UpdateEpisodeOutput> {
    try {
      const podcast = await this.podcasts.findOne(input.podcastId);
      if (!podcast) {
        return {
          ok: false,
          error: `Podcast with ID ${input.podcastId} not found.`,
        };
      }
      let episode = await this.episodes.findOne(input.episodeId);
      if (!episode) {
        return {
          ok: false,
          error: `Episode with ID ${input.episodeId} not found.`,
        };
      }
      episode = {
        ...episode,
        ...input,
      };
      this.episodes.save(episode);
      return { ok: true, episode };
    } catch (error) {
      return { ok: false, error };
    }
  }
}
