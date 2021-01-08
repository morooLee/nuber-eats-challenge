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
      const data = await this.podcasts.find();
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error };
    }
  }
  async createPodcast(input: CreatePodcastInput): Promise<CreatePodcastOutput> {
    try {
      const podcast = await this.podcasts.create({
        ...input,
        rating: 0,
        episodes: [],
      });
      const data = await this.podcasts.save(podcast);

      return { ok: true, data };
    } catch (error) {
      return { ok: false, error };
    }
  }
  async getPodcast({ id }: GetPodcastInput): Promise<GetPodcastOutput> {
    try {
      const data = await this.podcasts.findOne(id);
      if (!data) {
        return { ok: false, error: `Podcast with ID ${id} not found.` };
      }
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error };
    }
  }
  async deletePodcast({
    id,
  }: DeletePodcastInput): Promise<DeletePodcastOutput> {
    try {
      const podcast = await this.podcasts.findOne(id);
      if (!podcast) {
        return { ok: false, error: `Podcast with ID ${id} not found.` };
      }
      await this.podcasts.delete(id);
      return { ok: true };
    } catch (error) {
      return { ok: false, error };
    }
  }
  async updatePodcast(input: UpdatePodcastInput): Promise<UpdatePodcastOutput> {
    try {
      const podcast = await this.podcasts.findOne(input.id);
      if (!podcast) {
        return { ok: false, error: `Podcast with ID ${input.id} not found.` };
      }
      const data = await this.podcasts.save(input);
      return { ok: true, data };
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
      const data = await this.episodes.find({ podcast: podcast });
      return { ok: true, data };
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
      const episode = await this.episodes.create({
        title: input.title,
        description: input.description,
        podcast,
      });
      const data = await this.episodes.save(episode);

      return { ok: true, data };
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
      const episode = await this.episodes.findOne({ id: episodeId, podcast });
      if (!episode) {
        return {
          ok: false,
          error: `Episode with ID ${episodeId} not found.`,
        };
      }
      await this.episodes.delete({ id: episodeId, podcast });
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
      const data = await this.episodes.findOne({ id: episodeId, podcast });
      if (!data) {
        return {
          ok: false,
          error: `Episode with ID ${episodeId} not found.`,
        };
      }
      return { ok: true, data };
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
      const episode = await this.episodes.findOne({
        id: input.episodeId,
        podcast,
      });
      if (!episode) {
        return {
          ok: false,
          error: `Episode with ID ${input.episodeId} not found.`,
        };
      }
      const data = {
        ...episode,
        title: input.title,
        description: input.description,
      };
      this.episodes.save(data);
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error };
    }
  }
}
