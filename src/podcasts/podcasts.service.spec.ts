import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Episode } from './entities/episode.entity';
import { Podcast } from './entities/podcast.entity';
import { PodcastsService } from './podcasts.service';

const mockedPodcasts = [
  {
    id: 1,
    createdAt: '2021-01-15T19:17:37.400Z',
    updatedAt: '2021-01-15T19:17:37.400Z',
    title: '팟캐스트 타이틀',
    category: '팟캐스트 카테고리',
    rating: 0,
    episodes: [
      {
        id: 1,
        createdAt: '2021-01-15T19:17:37.400Z',
        updatedAt: '2021-01-15T19:17:37.400Z',
        title: '에피소드 타이틀',
        description: '에피소드 디스크립션',
        podcast: {
          id: 1,
        },
      },
    ],
  },
];
const mockPodcastRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
};

const mockEpisodeRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
};
type MockRepository<T> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('PodcastsService', () => {
  let service: PodcastsService;
  let podcastsRepository: MockRepository<Podcast>;
  let episodesRepository: MockRepository<Episode>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PodcastsService,
        {
          provide: getRepositoryToken(Podcast),
          useValue: mockPodcastRepository,
        },
        {
          provide: getRepositoryToken(Episode),
          useValue: mockEpisodeRepository,
        },
      ],
      imports: [],
    }).compile();
    service = module.get<PodcastsService>(PodcastsService);
    podcastsRepository = module.get(getRepositoryToken(Podcast));
    episodesRepository = module.get(getRepositoryToken(Episode));
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('getPodcasts', () => {
    it('should be get podcasts', async () => {
      podcastsRepository.find.mockResolvedValue(mockedPodcasts);
      const result = await service.getPodcasts();

      expect(result).toEqual({ ok: true, podcasts: mockedPodcasts });
    });
    it('should fail on exception', async () => {
      podcastsRepository.find.mockRejectedValue(
        new Error('Exception error occurred.'),
      );

      const result = await service.getPodcasts();
      expect(result).toEqual({
        ok: false,
        error: Error('Exception error occurred.'),
      });
    });
  });
  describe('createPodcast', () => {
    const newPodcast = {
      title: '타이틀',
      category: '카테고리',
      rating: 0,
      episodes: [],
    };
    const createPodcastArgs = {
      title: '타이틀',
      category: '카테고리',
    };
    it('should create a new podcast', async () => {
      podcastsRepository.create.mockReturnValue(newPodcast);
      podcastsRepository.save.mockResolvedValue(newPodcast);

      const result = await service.createPodcast(createPodcastArgs);

      expect(podcastsRepository.create).toHaveBeenCalledTimes(1);
      expect(podcastsRepository.create).toHaveBeenCalledWith(newPodcast);

      expect(podcastsRepository.save).toHaveBeenCalledTimes(1);
      expect(podcastsRepository.save).toHaveBeenCalledWith(newPodcast);

      expect(result).toEqual({ ok: true, podcast: newPodcast });
    });
    it('should fail on exception', async () => {
      podcastsRepository.create.mockRejectedValue(
        new Error('Exception error occurred.'),
      );
      const result = await service.createPodcast(createPodcastArgs);
      expect(result).toEqual({
        ok: false,
        error: Error('Exception error occurred.'),
      });
    });
  });
  describe('getPodcast', () => {
    it('should get podcast', async () => {
      podcastsRepository.findOne.mockResolvedValue(mockedPodcasts[0]);
      const result = await service.getPodcast({ id: 1 });
      expect(result).toEqual({ ok: true, podcast: mockedPodcasts[0] });
    });
    it('should fail if podcast not found', async () => {
      podcastsRepository.findOne.mockResolvedValue(undefined);
      const result = await service.getPodcast({ id: 1 });
      expect(result).toEqual({
        ok: false,
        error: 'Podcast with ID 1 not found.',
      });
    });
    it('should fail on exception', async () => {
      podcastsRepository.findOne.mockRejectedValue(
        new Error('Exception error occurred.'),
      );
      const result = await service.getPodcast({ id: 1 });
      expect(result).toEqual({
        ok: false,
        error: Error('Exception error occurred.'),
      });
    });
  });
  describe('deletePodcast', () => {
    it('should delete podcast', async () => {
      podcastsRepository.findOne.mockResolvedValue(mockedPodcasts[0]);
      episodesRepository.delete.mockResolvedValue({ ok: true });
      podcastsRepository.delete.mockResolvedValue({ ok: true });
      const result = await service.deletePodcast({ id: 1 });
      expect(result).toEqual({ ok: true });
    });
    it('should fail if podcast not found', async () => {
      podcastsRepository.findOne.mockResolvedValue(undefined);
      const result = await service.deletePodcast({ id: 1 });
      expect(result).toEqual({
        ok: false,
        error: 'Podcast with ID 1 not found.',
      });
    });
    it('should fail on exception', async () => {
      podcastsRepository.findOne.mockResolvedValue(mockedPodcasts[0]);
      episodesRepository.delete.mockResolvedValue({ ok: true });
      podcastsRepository.delete.mockRejectedValue(
        new Error('Exception error occurred.'),
      );
      const result = await service.deletePodcast({ id: 1 });
      expect(result).toEqual({
        ok: false,
        error: Error('Exception error occurred.'),
      });
    });
  });

  describe('updatePodcast', () => {
    const newPodcast = {
      id: 1,
      title: 'new 팟캐스트 타이틀',
      category: 'new 팟캐스트 카테고리',
      rating: 1,
    };
    it('should update podcast', async () => {
      podcastsRepository.findOne.mockResolvedValue(mockedPodcasts[0]);
      podcastsRepository.save.mockResolvedValue({
        ...mockedPodcasts[0],
        ...newPodcast,
      });
      const result = await service.updatePodcast(newPodcast);
      expect(result).toEqual({
        ok: true,
        podcast: { ...mockedPodcasts[0], ...newPodcast },
      });
    });
    it('should fail if podcast not found', async () => {
      podcastsRepository.findOne.mockResolvedValue(undefined);
      const result = await service.updatePodcast(newPodcast);
      expect(result).toEqual({
        ok: false,
        error: 'Podcast with ID 1 not found.',
      });
    });
    it('should fail on exception', async () => {
      podcastsRepository.findOne.mockResolvedValue(mockedPodcasts[0]);
      podcastsRepository.save.mockRejectedValue(
        new Error('Exception error occurred.'),
      );
      const result = await service.updatePodcast(newPodcast);
      expect(result).toEqual({
        ok: false,
        error: Error('Exception error occurred.'),
      });
    });
  });
  describe('getEpisodes', () => {
    it('should be get episodes', async () => {
      podcastsRepository.findOne.mockResolvedValue(mockedPodcasts[0]);
      episodesRepository.find.mockResolvedValue(mockedPodcasts[0].episodes);
      const result = await service.getEpisodes({ podcastId: 1 });

      expect(result).toEqual({
        ok: true,
        episodes: mockedPodcasts[0].episodes,
      });
    });
    it('should fail if podcast not found', async () => {
      podcastsRepository.findOne.mockResolvedValue(undefined);
      const result = await service.getEpisodes({ podcastId: 1 });
      expect(result).toEqual({
        ok: false,
        error: 'Podcast with ID 1 not found.',
      });
    });
    it('should fail on exception', async () => {
      podcastsRepository.findOne.mockResolvedValue(mockedPodcasts[0]);
      episodesRepository.find.mockRejectedValue(
        new Error('Exception error occurred.'),
      );

      const result = await service.getEpisodes({ podcastId: 1 });
      expect(result).toEqual({
        ok: false,
        error: Error('Exception error occurred.'),
      });
    });
  });
  describe('createEpisode', () => {
    const createEpisodeArgs = {
      podcastId: 1,
      title: '에피소드 타이틀',
      description: '에피소드 디스크립션',
    };
    it('should create a new episode', async () => {
      podcastsRepository.findOne.mockResolvedValue(mockedPodcasts[0]);
      episodesRepository.create.mockReturnValue(mockedPodcasts[0].episodes[0]);
      episodesRepository.save.mockResolvedValue(mockedPodcasts[0].episodes[0]);
      const result = await service.createEpisode(createEpisodeArgs);

      // expect(episodesRepository.create).toHaveBeenCalledTimes(1);
      // expect(episodesRsepository.create).toHaveBeenCalledWith(createEpisodeArgs);

      // expect(episodesRepository.save).toHaveBeenCalledTimes(1);
      // expect(episodesRepository.save).toHaveBeenCalledWith(
      //   mockedPodcasts[0].episodes[0],
      // );

      expect(result).toEqual({
        ok: true,
        episode: mockedPodcasts[0].episodes[0],
      });
    });
    it('should fail if podcast not found', async () => {
      podcastsRepository.findOne.mockResolvedValue(undefined);
      const result = await service.createEpisode(createEpisodeArgs);
      expect(result).toEqual({
        ok: false,
        error: 'Podcast with ID 1 not found.',
      });
    });
    it('should fail on exception', async () => {
      podcastsRepository.findOne.mockResolvedValue(mockedPodcasts[0]);
      episodesRepository.create.mockRejectedValue(
        new Error('Exception error occurred.'),
      );
      const result = await service.createEpisode(createEpisodeArgs);
      expect(result).toEqual({
        ok: false,
        error: Error('Exception error occurred.'),
      });
    });
  });
  describe('deleteEpisode', () => {
    it('should delete episode', async () => {
      podcastsRepository.findOne.mockResolvedValue(mockedPodcasts[0]);
      episodesRepository.findOne.mockResolvedValue(
        mockedPodcasts[0].episodes[0],
      );
      episodesRepository.delete.mockResolvedValue({ ok: true });
      const result = await service.deleteEpisode({
        podcastId: 1,
        episodeId: 1,
      });
      expect(result).toEqual({ ok: true });
    });
    it('should fail if podcast not found', async () => {
      podcastsRepository.findOne.mockResolvedValue(undefined);
      const result = await service.deleteEpisode({
        podcastId: 1,
        episodeId: 1,
      });
      expect(result).toEqual({
        ok: false,
        error: 'Podcast with ID 1 not found.',
      });
    });
    it('should fail if episode not found', async () => {
      podcastsRepository.findOne.mockResolvedValue(mockedPodcasts[0]);
      episodesRepository.findOne.mockResolvedValue(undefined);
      const result = await service.deleteEpisode({
        podcastId: 1,
        episodeId: 1,
      });
      expect(result).toEqual({
        ok: false,
        error: 'Episode with ID 1 not found.',
      });
    });
    it('should fail on exception', async () => {
      podcastsRepository.findOne.mockResolvedValue(mockedPodcasts[0]);
      episodesRepository.findOne.mockRejectedValue(
        new Error('Exception error occurred.'),
      );
      const result = await service.deleteEpisode({
        podcastId: 1,
        episodeId: 1,
      });
      expect(result).toEqual({
        ok: false,
        error: Error('Exception error occurred.'),
      });
    });
  });
  describe('getEpisode', () => {
    it('should get episode', async () => {
      podcastsRepository.findOne.mockResolvedValue(mockedPodcasts[0]);
      episodesRepository.findOne.mockResolvedValue(
        mockedPodcasts[0].episodes[0],
      );
      const result = await service.getEpisode({ podcastId: 1, episodeId: 1 });
      expect(result).toEqual({
        ok: true,
        episode: mockedPodcasts[0].episodes[0],
      });
    });
    it('should fail if podcast not found', async () => {
      podcastsRepository.findOne.mockResolvedValue(undefined);
      const result = await service.getEpisode({ podcastId: 1, episodeId: 1 });
      expect(result).toEqual({
        ok: false,
        error: 'Podcast with ID 1 not found.',
      });
    });
    it('should fail if episode not found', async () => {
      podcastsRepository.findOne.mockResolvedValue(mockedPodcasts[0]);
      episodesRepository.findOne.mockResolvedValue(undefined);
      const result = await service.getEpisode({ podcastId: 1, episodeId: 1 });
      expect(result).toEqual({
        ok: false,
        error: 'Episode with ID 1 not found.',
      });
    });
    it('should fail on exception', async () => {
      podcastsRepository.findOne.mockResolvedValue(mockedPodcasts[0]);
      episodesRepository.findOne.mockRejectedValue(
        new Error('Exception error occurred.'),
      );
      const result = await service.getEpisode({ podcastId: 1, episodeId: 1 });
      expect(result).toEqual({
        ok: false,
        error: Error('Exception error occurred.'),
      });
    });
  });
  describe('updateEpisode', () => {
    const newEpisode = {
      id: 1,
      title: 'new 에피소드 타이틀',
      description: 'new 에피소드 디스크립션',
    };
    const updateEpisodeArgs = {
      podcastId: 1,
      episodeId: newEpisode.id,
      ...newEpisode,
    };
    it('should update podcast', async () => {
      podcastsRepository.findOne.mockResolvedValue(mockedPodcasts[0]);
      episodesRepository.findOne.mockResolvedValue(
        mockedPodcasts[0].episodes[0],
      );
      episodesRepository.save.mockResolvedValue({
        ...mockedPodcasts[0].episodes[0],
        ...newEpisode,
      });
      const result = await service.updateEpisode(updateEpisodeArgs);
      expect(result).toEqual({
        ok: true,
        episode: { ...mockedPodcasts[0].episodes[0], ...newEpisode },
      });
    });
    it('should fail if podcast not found', async () => {
      podcastsRepository.findOne.mockResolvedValue(undefined);
      const result = await service.updateEpisode(updateEpisodeArgs);
      expect(result).toEqual({
        ok: false,
        error: 'Podcast with ID 1 not found.',
      });
    });
    it('should fail if episode not found', async () => {
      podcastsRepository.findOne.mockResolvedValue(mockedPodcasts[0]);
      episodesRepository.findOne.mockResolvedValue(undefined);
      const result = await service.updateEpisode(updateEpisodeArgs);
      expect(result).toEqual({
        ok: false,
        error: 'Episode with ID 1 not found.',
      });
    });
    it('should fail on exception', async () => {
      podcastsRepository.findOne.mockResolvedValue(mockedPodcasts[0]);
      episodesRepository.findOne.mockResolvedValue(
        mockedPodcasts[0].episodes[0],
      );
      episodesRepository.save.mockRejectedValue(
        new Error('Exception error occurred.'),
      );
      const result = await service.updateEpisode(updateEpisodeArgs);
      expect(result).toEqual({
        ok: false,
        error: Error('Exception error occurred.'),
      });
    });
  });
});
