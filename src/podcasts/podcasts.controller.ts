import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Podcast } from './entities/podcast.entity';
import { PodcastsService } from './podcasts.service';

@Controller('podcasts')
export class PodcastsController {
  constructor(private readonly podcastsService: PodcastsService) {}

  @Get()
  getPodcasts(): Podcast[] {
    return this.podcastsService.getPodcasts();
  }
  @Post()
  createPodcast(@Body() data) {
    return this.podcastsService.createPodcast(data);
  }
  @Get(':id')
  getPodcast(@Param('id') id: string) {
    return this.podcastsService.getPodcast(+id);
  }
  @Patch(':id')
  updatePodcast(@Param('id') id: string, @Body() data) {
    return this.podcastsService.updatePodcast(+id, data);
  }
  @Delete(':id')
  deletePodcast(@Param('id') id: string) {
    return this.podcastsService.deletePodcast(+id);
  }
  @Get(':id/episodes')
  getEpisodes(@Param('id') podcastId: string) {
    return this.podcastsService.getEpisodes(+podcastId);
  }
  @Post(':id/episodes')
  createEpisode(@Param('id') podcastId: string, @Body() data) {
    return this.podcastsService.createEpisode(+podcastId, data);
  }
  @Patch(':id/episodes/:episodeId')
  updateEpisode(
    @Param('id') podcastId: string,
    @Param('episodeId') episodeId: string,
    @Body() data,
  ) {
    return this.podcastsService.updateEpisode(+podcastId, +episodeId, data);
  }
  @Delete(':id/episodes/:episodeId')
  deleteEpisode(
    @Param('id') podcastId: string,
    @Param('episodeId') episodeId: string,
  ) {
    return this.podcastsService.deleteEpisode(+podcastId, +episodeId);
  }
}
