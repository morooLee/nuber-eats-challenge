import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { SignInInput, SignInOutput } from './dtos/sign-in.dto';
import { ProfileInput, ProfileOutput } from './dtos/profile.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import {
  UpdateProfileInput,
  UpdateProfileOutput,
} from './dtos/update-profile.dto';
import { Role } from 'src/auth/role.decorator';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Role(['Any'])
  @Query(() => User)
  me(@AuthUser() authUser: User) {
    return authUser;
  }

  @Mutation(() => CreateAccountOutput)
  async createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    return await this.usersService.createAccount(createAccountInput);
  }

  @Mutation(() => SignInOutput)
  async signIn(@Args('input') signInInput: SignInInput): Promise<SignInOutput> {
    return await this.usersService.signIn(signInInput);
  }

  @Role(['Any'])
  @Query(() => ProfileOutput)
  async profile(@Args() profileInput: ProfileInput): Promise<ProfileOutput> {
    return await this.usersService.findById(profileInput.userId);
  }

  @Role(['Any'])
  @Mutation(() => UpdateProfileOutput)
  async updateProfile(
    @AuthUser() authUser: User,
    @Args('input') updateProfileInput: UpdateProfileInput,
  ): Promise<UpdateProfileOutput> {
    return await this.usersService.updateProfile(
      authUser.id,
      updateProfileInput,
    );
  }
}
