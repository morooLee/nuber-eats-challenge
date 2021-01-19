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
    title: '타이틀',
    category: '카테고리',
    rating: 1,
    episodes: [],
  },
];
const mockRepository = {
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
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Episode),
          useValue: mockRepository,
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
      const mockedPodcasts = [];

      podcastsRepository.find.mockResolvedValue(mockedPodcasts);
      const result = await service.getPodcasts();

      expect(result).toEqual({ ok: true, podcasts: [] });
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
  it.todo('getPodcast');
  it.todo('deletePodcast');
  it.todo('updatePodcast');
  it.todo('getEpisodes');
  it.todo('createEpisode');
  it.todo('deleteEpisode');
  it.todo('getEpisode');
  it.todo('updateEpisode');
});
