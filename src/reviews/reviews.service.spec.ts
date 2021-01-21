import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { Episode } from 'src/podcasts/entities/episode.entity';
import { Podcast } from 'src/podcasts/entities/podcast.entity';
import { PodcastsService } from 'src/podcasts/podcasts.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { ReviewsService } from './reviews.service';

const mockJwtService = {
  sign: jest.fn(() => 'signed-token-baby'),
  verify: jest.fn(),
};

const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
};

type MockRepository<T> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('ReviewsService', () => {
  let service: ReviewsService;
  let reviewsRepository: MockRepository<Review>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        UsersService,
        PodcastsService,
        {
          provide: getRepositoryToken(Review),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Podcast),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Episode),
          useValue: mockRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    reviewsRepository = module.get(getRepositoryToken(Review));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
