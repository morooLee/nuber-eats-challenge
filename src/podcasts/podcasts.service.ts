import { Injectable, NotFoundException } from '@nestjs/common';
import { Episode } from './entities/episode.entity';
import { Podcast } from './entities/podcast.entity';

@Injectable()
export class PodcastsService {
  private podcasts: Podcast[] = [];

  getPodcasts(): Podcast[] {
    return this.podcasts;
  }

  createPodcast(data): Podcast {
    this.podcasts.push({
      id: this.podcasts.length + 1,
      ...data,
    });
    return this.getPodcast(this.podcasts.length);
  }

  getPodcast(id: number): Podcast {
    const result = this.podcasts.find((podcast) => podcast.id === id);
    if (!result) {
      throw new NotFoundException(`Podcast with ID ${id} not found.`);
    }
    return result;
  }

  updatePodcast(id: number, data): Podcast {
    const oldPodcast = this.getPodcast(id);
    const newPodcast = { ...oldPodcast, ...data };
    this.deletePodcast(id);
    this.podcasts.push(newPodcast);

    return this.getPodcast(id);
  }

  deletePodcast(id: number): boolean {
    let result = false;
    this.getPodcast(id);
    this.podcasts = this.podcasts.filter((podcast) => podcast.id !== id);
    result = true;

    return result;
  }

  getEpisodes(podcastId: number): Episode[] {
    const podcast = this.getPodcast(podcastId);
    return podcast.episodes;
  }

  createEpisode(podcastId: number, data): Episode {
    const podcast = this.getPodcast(podcastId);
    podcast.episodes.push({
      id: podcast.episodes.length + 1,
      ...data,
    });
    return this.getEpisode(podcastId, podcast.episodes.length);
  }

  getEpisode(podcastId: number, episodeId: number): Episode {
    const podcast = this.getPodcast(podcastId);
    const result = podcast.episodes.find((episode) => episode.id === episodeId);
    if (!result) {
      throw new NotFoundException(`Episode with ID ${episodeId} not found.`);
    }
    return result;
  }

  updateEpisode(podcastId: number, episodeId: number, data): Episode {
    const podcast = this.getPodcast(podcastId);
    const oldEpisode = this.getEpisode(podcastId, episodeId);
    const newEpisode = { ...oldEpisode, ...data };
    this.deleteEpisode(podcastId, episodeId);
    podcast.episodes.push(newEpisode);

    return this.getEpisode(podcastId, episodeId);
  }

  deleteEpisode(podcastId: number, episodeId: number): boolean {
    let result = false;
    const podcast = this.getPodcast(podcastId);
    this.getEpisode(podcastId, episodeId);
    podcast.episodes = podcast.episodes.filter(
      (episode) => episode.id !== episodeId,
    );
    result = true;

    return result;
  }
}
