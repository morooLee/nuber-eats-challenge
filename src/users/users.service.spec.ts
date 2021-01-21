import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';
import { Podcast } from 'src/podcasts/entities/podcast.entity';
import { Episode } from 'src/podcasts/entities/episode.entity';
import { PodcastsService } from 'src/podcasts/podcasts.service';

const mockRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(() => 'signed-token-baby'),
  verify: jest.fn(),
};

type MockRepository<T> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: MockRepository<User>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        PodcastsService,
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
    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('createAccount', () => {
    const createAccountArgs = {
      email: 'test@email.com',
      password: 'password',
      role: UserRole.Host,
    };

    it('should be fail if user exists', async () => {
      usersRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'test@email.com',
      });
      const result = await service.createAccount(createAccountArgs);

      expect(result).toEqual({
        ok: false,
        error: 'There is a user with that email alraedy.',
      });
    });
    it('should create a new user', async () => {
      usersRepository.findOne.mockResolvedValue(undefined);
      usersRepository.create.mockReturnValue(createAccountArgs);
      usersRepository.save.mockResolvedValue(createAccountArgs);

      const result = await service.createAccount(createAccountArgs);

      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs);

      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs);

      expect(result).toEqual({
        ok: true,
        user: {
          email: 'test@email.com',
          password: 'password',
          role: UserRole.Host,
        },
      });
    });
    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(
        new Error('Exception error occurred.'),
      );
      const result = await service.createAccount(createAccountArgs);
      expect(result).toEqual({
        ok: false,
        error: Error('Exception error occurred.'),
      });
    });
  });
  describe('signIn', () => {
    const signInrgs = {
      email: 'test@email.com',
      password: 'password',
    };
    it('should fail if user does not exist', async () => {
      usersRepository.findOne.mockResolvedValue(undefined);

      const result = await service.signIn(signInrgs);

      // expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        email: 'test@email.com',
      });
      expect(result).toEqual({
        ok: false,
        error: 'User not found.',
      });
    });
    it('should fail if the password is wrong', async () => {
      const mockedUser = {
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };

      usersRepository.findOne.mockResolvedValue(mockedUser);

      const result = await service.signIn(signInrgs);

      expect(result).toEqual({ ok: false, error: 'Wrong password.' });
    });

    it('should return token if password correct', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.signIn(signInrgs);
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual({ ok: true, token: 'signed-token-baby' });
    });

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(
        new Error('Exception error occurred.'),
      );
      const result = await service.signIn(signInrgs);
      expect(result).toEqual({
        ok: false,
        error: Error('Exception error occurred.'),
      });
    });
  });
  describe('findById', () => {
    const findByIdArgs = {
      id: 1,
    };
    it('should find an existing user', async () => {
      usersRepository.findOne.mockResolvedValue(findByIdArgs);
      const result = await service.findById(1);

      expect(result).toEqual({ ok: true, user: { id: 1 } });
    });

    it('should fail if no user is found', async () => {
      usersRepository.findOne.mockResolvedValue(undefined);
      const result = await service.findById(1);

      expect(result).toEqual({ ok: false, error: 'User not found.' });
    });
    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(
        new Error('Exception error occurred.'),
      );
      const result = await service.findById(1);
      expect(result).toEqual({
        ok: false,
        error: Error('Exception error occurred.'),
      });
    });
  });

  describe('updateProfile', () => {
    it('should fail if no user is found', async () => {
      const updateProfileArgs = {
        userId: 1,
        input: { email: 'new@email.com' },
      };

      usersRepository.findOne.mockResolvedValue(undefined);
      const result = await service.updateProfile(
        updateProfileArgs.userId,
        updateProfileArgs.input,
      );

      expect(result).toEqual({ ok: false, error: 'User not found.' });
    });
    it('should change email', async () => {
      const oldUser = {
        id: 1,
        email: 'old@email.com',
        password: 'old.passwrod',
        role: UserRole.Host,
      };
      const newUser = {
        id: 1,
        email: 'new@email.com',
        password: 'old.passwrod',
        role: UserRole.Host,
      };
      const updateProfileArgs = {
        userId: 1,
        input: { email: 'new@email.com' },
      };

      usersRepository.findOne.mockResolvedValue(oldUser);
      usersRepository.save.mockResolvedValue(newUser);

      const result = await service.updateProfile(
        updateProfileArgs.userId,
        updateProfileArgs.input,
      );
      // expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(
        updateProfileArgs.userId,
      );
      // expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(newUser);
      expect(result).toEqual({ ok: true, user: newUser });
    });
    it('should change password', async () => {
      const oldUser = {
        id: 1,
        email: 'old@email.com',
        password: 'old.passwrod',
        role: UserRole.Host,
      };
      const newUser = {
        id: 1,
        email: 'old@email.com',
        password: 'new.password',
        role: UserRole.Host,
      };
      const updateProfileArgs = {
        userId: 1,
        input: { password: 'new.password' },
      };

      usersRepository.findOne.mockResolvedValue(oldUser);
      usersRepository.save.mockResolvedValue(newUser);

      const result = await service.updateProfile(
        updateProfileArgs.userId,
        updateProfileArgs.input,
      );

      // expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(
        updateProfileArgs.userId,
      );
      // expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(newUser);
      expect(result).toEqual({ ok: true, user: newUser });
    });

    it('should change role', async () => {
      const oldUser = {
        id: 1,
        email: 'old@email.com',
        password: 'old.passwrod',
        role: UserRole.Host,
      };
      const newUser = {
        id: 1,
        email: 'old@email.com',
        password: 'old.passwrod',
        role: UserRole.Listener,
      };
      const updateProfileArgs = {
        userId: 1,
        input: { role: UserRole.Listener },
      };

      usersRepository.findOne.mockResolvedValue(oldUser);
      usersRepository.save.mockResolvedValue(newUser);

      const result = await service.updateProfile(
        updateProfileArgs.userId,
        updateProfileArgs.input,
      );

      // expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(
        updateProfileArgs.userId,
      );
      // expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(newUser);
      expect(result).toEqual({ ok: true, user: newUser });
    });
    it('should change all', async () => {
      const oldUser = {
        id: 1,
        email: 'old@email.com',
        password: 'old.passwrod',
        role: UserRole.Host,
      };
      const newUser = {
        id: 1,
        email: 'new@email.com',
        password: 'new.passwrod',
        role: UserRole.Listener,
      };
      const updateProfileArgs = {
        userId: 1,
        input: {
          email: 'new@email.com',
          password: 'new.passwrod',
          role: UserRole.Listener,
        },
      };

      usersRepository.findOne.mockResolvedValue(oldUser);
      usersRepository.save.mockResolvedValue(newUser);

      const result = await service.updateProfile(
        updateProfileArgs.userId,
        updateProfileArgs.input,
      );

      // expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(
        updateProfileArgs.userId,
      );
      // expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(newUser);
      expect(result).toEqual({ ok: true, user: newUser });
    });
    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(
        new Error('Exception error occurred.'),
      );
      const result = await service.updateProfile(1, {
        email: 'exception@email.com',
      });
      expect(result).toEqual({
        ok: false,
        error: Error('Exception error occurred.'),
      });
    });
  });
});
