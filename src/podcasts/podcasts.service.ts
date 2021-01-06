import { Injectable } from '@nestjs/common';
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
  private podcasts: Podcast[] = [];

  getPodcasts(): GetPodcastsOutput {
    return { ok: true, data: this.podcasts };
  }

  createPodcast(data: CreatePodcastInput): CreatePodcastOutput {
    const podcast = {
      id: this.podcasts.length + 1,
      ...data,
      rating: 0,
      episodes: [],
    };
    this.podcasts.push(podcast);
    return { ok: true, data: podcast };
  }

  getPodcast({ id }: GetPodcastInput): GetPodcastOutput {
    const podcast = this.podcasts.find((item) => item.id === id);
    if (!podcast) {
      return { ok: false, error: `Podcast with ID ${id} not found.` };
    }
    return { ok: true, data: podcast };
  }

  deletePodcast({ id }: DeletePodcastInput): DeletePodcastOutput {
    const result = this.getPodcast({ id });

    if (!result.ok) {
      return result;
    }
    this.podcasts = this.podcasts.filter((podcast) => podcast.id !== id);
    return { ok: true };
  }

  updatePodcast({ id, ...data }: UpdatePodcastInput): UpdatePodcastOutput {
    let result = this.getPodcast({ id });
    if (!result.ok) {
      return result;
    }
    const podcast = { ...result.data, ...data };

    result = this.deletePodcast({ id });
    if (!result.ok) {
      return result;
    }

    this.podcasts.push(podcast);

    return { ok: true, data: podcast };
  }

  getEpisodes({ podcastId: id }: GetEpisodesInput): GetEpisodesOutput {
    const { ok, data, error } = this.getPodcast({ id });
    if (!ok) {
      return { ok, error };
    }

    return { ok: true, data: data.episodes };
  }

  createEpisode({
    podcastId: id,
    ...data
  }: CreateEpisodeInput): CreateEpisodeOutput {
    const { ok, data: podcast, error } = this.getPodcast({ id });

    if (!ok) {
      return { ok, error };
    }
    const episode = {
      id: podcast.episodes.length + 1,
      ...data,
    };
    podcast.episodes.push(episode);
    return { ok: true, data: episode };
  }

  deleteEpisode({
    podcastId,
    episodeId,
  }: DeleteEpisodeInput): DeleteEpisodeOutput {
    const podcastResult = this.getPodcast({ id: podcastId });

    if (!podcastResult.ok) {
      return { ...podcastResult };
    }

    const episodeResult = this.getEpisode({ podcastId, episodeId });

    if (!episodeResult.ok) {
      return { ...episodeResult };
    }
    podcastResult.data.episodes = podcastResult.data.episodes.filter(
      (episode) => episode.id !== episodeId,
    );

    return { ok: true };
  }

  getEpisode({ podcastId, episodeId }: GetEpisodeInput): GetEpisodeOutput {
    const result = this.getPodcast({ id: podcastId });

    if (!result.ok) {
      return { ...result, data: undefined };
    }
    const episode = result.data.episodes.find(
      (episode) => episode.id === episodeId,
    );
    if (!episode) {
      return { ok: false, error: `Episode with ID ${episodeId} not found.` };
    }
    return { ok: true, data: episode };
  }

  updateEpisode({
    podcastId,
    episodeId,
    ...data
  }: UpdateEpisodeInput): UpdateEpisodeOutput {
    let result: {
      ok: boolean;
      data?: Podcast | Episode;
      error?: string;
    };
    result = this.getPodcast({ id: podcastId });
    if (!result.ok) {
      return { ...result, data: undefined };
    }
    const podcast = result.data as Podcast;

    result = this.getEpisode({ podcastId, episodeId });

    if (!result.ok) {
      return { ...result, data: undefined };
    }
    const episode = { ...(result.data as Episode), ...data };

    result = this.deleteEpisode({ podcastId, episodeId });
    if (!result.ok) {
      return { ...result, data: undefined };
    }

    result = this.updatePodcast({
      id: podcastId,
      episodes: [...podcast.episodes, episode],
    });
    if (!result.ok) {
      return { ...result, data: undefined };
    }
    return { ok: true, data: episode };
  }
}
