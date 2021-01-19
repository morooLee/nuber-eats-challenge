import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { SignInInput, SignInOutput } from './dtos/sign-in.dto';
import { User } from './entities/user.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { ProfileOutput } from './dtos/profile.dto';
import {
  UpdateProfileInput,
  UpdateProfileOutput,
} from './dtos/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const exists = await this.users.findOne({ email });
      if (exists) {
        return { ok: false, error: 'There is a user with that email alraedy.' };
      }
      let user = await this.users.create({ email, password, role });
      user = await this.users.save(user);
      return { ok: true, user };
    } catch (error) {
      return { ok: false, error };
    }
  }

  async signIn({ email, password }: SignInInput): Promise<SignInOutput> {
    try {
      const user = await this.users.findOne({ email });
      if (!user) {
        return { ok: false, error: 'User not found.' };
      }

      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return { ok: false, error: 'Wrong password.' };
      }

      const token = await this.jwtService.sign({ id: user.id });

      return { ok: true, token };
    } catch (error) {
      return { ok: false, error };
    }
  }

  async findById(id: number): Promise<ProfileOutput> {
    try {
      const user = await this.users.findOne({ id });

      if (!user) {
        return { ok: false, error: 'User not found.' };
      }
      return { ok: true, user };
    } catch (error) {
      return { ok: false, error };
    }
  }

  async updateProfile(
    userId: number,
    { email, password, role }: UpdateProfileInput,
  ): Promise<UpdateProfileOutput> {
    try {
      let user = await this.users.findOne(userId);
      if (!user) {
        return { ok: false, error: 'User not found.' };
      }

      if (email) {
        user.email = email;
      }
      if (password) {
        user.password = password;
      }
      if (role) {
        user.role = role;
      }

      user = await this.users.save(user);
      return {
        ok: true,
        user,
      };
    } catch (error) {
      return { ok: false, error };
    }
  }
}
