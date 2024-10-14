import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthSignUpDto } from 'src/auth/dto/auth-signup.dto';
import { AwsService } from 'src/aws/aws.service';
import { CommonService } from 'src/common/common.service';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { CreateProfileImageDto } from './dto/create-profile-image.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ProfileImageEntity } from './entity/profile-image.entity';
import { UserEntity } from './entity/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileImageEntity)
    private readonly profileImageRepository: Repository<ProfileImageEntity>,
    private readonly commonService: CommonService,
    private readonly awsService: AwsService,
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
    const user = await this.getOneUser({
      where: { id },
      relations: { profile: true },
    });
    return user;
  }

  async getUserWithTeam(id: number) {
    const user = await this.getOneUser({
      where: { id },
      relations: { profile: true, team: true, lead: true, subLead: true },
    });
    Logger.log(user);

    return user;
  }

  async getUserWithPosts(id: number) {
    const user = await this.getOneUser({
      where: { id },
      relations: { profile: true, posts: true, likedPosts: true },
    });

    return user;
  }

  async getUserWithTeamAndPosts(id: number) {
    const user = await this.getOneUser({
      where: { id },
      relations: {
        profile: true,
        team: true,
        lead: true,
        subLead: true,
        posts: true,
      },
    });

    return user;
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
    const user = await this.getOneUser({
      where: { account },
      relations: { profile: true },
    });
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
    const { phone, email, community, path }: UpdateUserDto = updateUserDto;

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

    if (path) {
      this.awsService.deleteImage(
        `/public/images/profile/${user.profile.path}`,
      );

      user.profile.path = path;
    }

    if (community) {
      user.community = community;
    }

    this.userRepository.save(user);

    return user;
  }

  /**
   *
   */
  async createProfileImage(dto: CreateProfileImageDto) {
    const currentPath = `public/images/temp/${dto.path}`;
    const result = this.profileImageRepository.save(dto);
    const response = await this.awsService.moveImage(
      currentPath,
      `public/images/profile/${dto.path}`,
    );

    return result;
  }

  /**
   *
   */
  async getOneUser(findOptions: FindOneOptions<UserEntity>) {
    const user = await this.userRepository.findOne(findOptions);

    if (!user) {
      throw new NotFoundException('해당 유저가 존재하지 않습니다.');
    }

    return user;
  }

  /**
   *
   */
  async getManyUsers(findOptions?: FindManyOptions<UserEntity>) {
    const users = await this.userRepository.find(findOptions ?? null);

    if (!users) {
      throw new NotFoundException('해당 유저가 존재하지 않습니다.');
    }

    return users;
  }

  /**
   *
   */
  async saveImage(file: Express.Multer.File) {
    return await this.awsService.imageUpload('temp', file);
  }
}
