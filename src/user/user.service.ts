import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { AuthSignUpDto } from 'src/auth/dto/auth-signup.dto';
import { CommonService } from 'src/common/common.service';
import { PROFILE_IMAGE_PATH } from 'src/common/const/path.const';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entity/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly commonService: CommonService,
  ) {}

  /**
   * 1. receive user information
   * 2. check already registered account, email, phone
   * 3. save new user in user repository
   */
  async createUser(dto: AuthSignUpDto) {
    const { account, phone, email }: AuthSignUpDto = dto;

    if (account && (await this.userRepository.exists({ where: { account } }))) {
      throw new ConflictException('이미 등록된 계정입니다.');
    }

    if (phone && (await this.userRepository.exists({ where: { phone } }))) {
      throw new ConflictException('이미 등록된 연락처입니다.');
    }

    if (email && (await this.userRepository.exists({ where: { email } }))) {
      throw new ConflictException('이미 등록된 이메일입니다.');
    }

    const newUser = this.userRepository.create(dto);

    return await this.userRepository.save(newUser);
  }

  /**
   * 1. receive request
   * 2. get all users from user repository
   * 3. return users
   */
  async getUsers(): Promise<UserEntity[]> {
    const user = await this.getManyUsers();
    return user;
  }

  /**
   * 1. receive user id
   * 2. get user by user id from user repository
   * 3. return user
   */
  async getUserById(id: number): Promise<UserEntity> {
    const user = await this.getOneUser({ where: { id } });
    return user;
  }

  async getUserWithTeam(id: number) {
    const user = await this.getOneUser({
      where: { id },
      relations: { team: true, lead: true, subLead: true },
    });
    Logger.log(user);

    return user;
  }

  async getUserWithPosts(id: number) {
    const user = await this.getOneUser({
      where: { id },
      relations: { posts: true, likedPosts: true },
    });

    return user;
  }

  async getUserWithTeamAndPosts(id: number) {
    const user = await this.getOneUser({
      where: { id },
      relations: {
        team: true,
        lead: true,
        subLead: true,
        posts: true,
      },
    });
  }

  async getUserByFindOptions(findOptions: FindOneOptions<UserEntity>) {
    const user = await this.getOneUser(findOptions);
    return user;
  }

  /**
   * 1. receive user account
   * 2. get user by user account from user repostitory
   * 3. return user
   */
  async getUserByUserAccount(account: string): Promise<UserEntity> {
    const user = await this.getOneUser({ where: { account } });
    return user;
  }

  /**
   * 1. receive data for update user information
   * 2. request get user by user id
   * 3. compare input password and stored password
   * 4. check duplicated user email and phone
   * 5. update data for target user
   * 6. if exist user profile in recieved user data request delete current profile and save new profile
   * 7. save updated user
   */
  async updateUser(
    user: UserEntity,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const { phone, email, community, profile }: UpdateUserDto = updateUserDto;

    if (phone && user.phone !== phone) {
      const userPhoneExists = await this.userRepository.findOne({
        where: { phone },
      });

      if (userPhoneExists) {
        throw new ConflictException('이미 등록된 연락처입니다.');
      }

      user.phone = phone;
    }

    if (email && user.email !== email) {
      const userExists = await this.userRepository.findOne({
        where: { email },
      });

      if (userExists) {
        throw new ConflictException('이미 등록된 이메일 입니다.');
      }

      user.email = email;
    }

    if (profile) {
      user.profile &&
        this.commonService.removeFile(PROFILE_IMAGE_PATH, user.profile);
      user.profile = profile;
    }

    this.userRepository.save(user);

    if (community) {
      user.community = community;
    }

    return user;
  }

  async getOneUser(findOptions: FindOneOptions<UserEntity>) {
    const user = await this.userRepository.findOne(findOptions);

    if (!user) {
      throw new NotFoundException('해당 유저가 존재하지 않습니다.');
    }

    return user;
  }

  async getManyUsers(findOptions?: FindManyOptions<UserEntity>) {
    const users = await this.userRepository.find(findOptions ?? null);

    if (!users) {
      throw new NotFoundException('해당 유저가 존재하지 않습니다.');
    }

    return users;
  }
}
