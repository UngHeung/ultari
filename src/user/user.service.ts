import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthLoginDto } from 'src/auth/dto/auth-login.dto';
import { AuthSignUpDto } from 'src/auth/dto/auth-signup.dto';
import { AwsService } from 'src/aws/aws.service';
import { CommonService } from 'src/common/common.service';
import { ImageTypeEnum } from 'src/common/enum/image.enum';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { UpdateUserDataDto } from './dto/update-user-data.dto';
import { UpdateUserTeamDto } from './dto/update-user-team.dto';
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
   * # POST
   * create user
   */
  async createUser(dto: AuthSignUpDto): Promise<UserEntity> {
    return await this.registUser(dto);
  }

  /**
   * # POST
   * save image to S3
   */
  async saveImage(file: Express.Multer.File): Promise<{ fileName: string }> {
    return await this.awsService.imageUpload('temp', file);
  }

  /**
   * # GET
   * get my user data
   */
  async getUserData(id: number): Promise<UserEntity> {
    return await this.getUser({ where: { id } });
  }

  /**
   * # GET
   * get user and users team.
   */
  async getUserDataAndTeam(id: number): Promise<UserEntity> {
    return await this.getUser({
      where: { id },
      relations: { team: true },
    });
  }

  /**
   * # GET
   * get user and users posts.
   */
  async getUserDataAndPosts(id: number): Promise<UserEntity> {
    return await this.getUser({
      where: { id },
      relations: { posts: true },
    });
  }

  /**
   * # Base POST
   * regist user
   */
  async registUser(dto: AuthSignUpDto): Promise<UserEntity> {
    const user = this.userRepository.create({
      ...dto,
    });

    this.registUserValidator(dto);

    const result = await this.userRepository.save(user);

    delete result.password;

    return result;
  }

  /**
   * # Base POST
   * has password for login
   */
  async findUserAndPassword(dto: AuthLoginDto): Promise<UserEntity> {
    return await this.userRepository.findOne({
      where: [{ account: dto?.account }, { id: dto?.id }],
      relations: { profile: true },
    });
  }

  /**
   * # Base POST
   * create user profile
   */
  createUserProfile(user: UserEntity, profilePath: string): ProfileImageEntity {
    const profile = this.profileImageRepository.create({
      user,
      path: profilePath,
      type: ImageTypeEnum.PROFILE_IMAGE,
    });

    this.awsService.moveImage(
      `public/images/temp/${profilePath}`,
      `public/images/profile/${profilePath}`,
    );

    return profile;
  }

  /**
   * # Base GET
   * find all users
   */
  async getUsersAll(): Promise<UserEntity[]> {
    const users = await this.getManyUsers({ relations: { team: true } });

    users.map(user => delete user.password);

    return users;
  }

  /**
   * # Base GET
   * find one user
   */
  async getUser(
    findOneOptions: FindOneOptions<UserEntity>,
  ): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      ...findOneOptions,
      relations: { profile: true },
    });

    delete user.password;

    return user;
  }

  /**
   * # Base GET
   * find many users
   */
  async getManyUsers(
    findManyOptions: FindManyOptions<UserEntity>,
  ): Promise<UserEntity[]> {
    return await this.userRepository.find({
      ...findManyOptions,
      relations: { profile: true },
      select: { password: false },
    });
  }

  /**
   * Base GET
   * find profile
   */
  async getUserProfile(
    findOneOptions: FindOneOptions<ProfileImageEntity>,
  ): Promise<ProfileImageEntity> {
    return await this.profileImageRepository.findOne({
      ...findOneOptions,
    });
  }

  /**
   * # Base PUT
   * update user data
   */
  async updateUserData(
    user: UserEntity,
    dto: UpdateUserDataDto,
  ): Promise<UserEntity> {
    await this.updateUserValidator(user, dto);

    user.phone = dto.phone;
    user.email = dto.email;
    user.community = dto.community;

    if (dto.newProfilePath) {
      if (user.profile) {
        await this.awsService.moveImage(
          `public/images/profile/${user.profile.path}`,
          `public/images/temp/${user.profile.path}`,
        );

        user.profile.path = dto.newProfilePath;
      } else {
        const profile = this.createUserProfile(user, dto.newProfilePath);

        user.profile = profile;
      }
    }

    return await this.userRepository.save(user);
  }

  /**
   * # Validation
   * user dto validator for regist
   */
  async registUserValidator(dto: AuthSignUpDto): Promise<void> {
    const { account, phone, email }: AuthSignUpDto = dto;

    if (!account) {
      throw new BadRequestException('아이디를 입력해주세요.');
    }

    if (!phone) {
      throw new BadRequestException('연락처를 입력해주세요.');
    }

    if (!email) {
      throw new BadRequestException('이메일을 입력해주세요.');
    }

    if (await this.userRepository.exists({ where: { account } })) {
      throw new ConflictException('이미 등록된 계정입니다.');
    }

    if (await this.userRepository.exists({ where: { phone } })) {
      throw new ConflictException('이미 등록된 연락처입니다.');
    }

    if (await this.userRepository.exists({ where: { email } })) {
      throw new ConflictException('이미 등록된 이메일입니다.');
    }
  }

  /**
   * # Validation
   * user dto validator for update
   */
  async updateUserValidator(
    user: UserEntity,
    dto: UpdateUserDataDto,
  ): Promise<void> {
    const { phone, email, community } = dto;

    if (!phone) {
      throw new BadRequestException('연락처를 입력해주세요.');
    }

    if (!email) {
      throw new BadRequestException('이메일을 입력해주세요.');
    }

    if (!community) {
      throw new BadRequestException('소속을 입력해주세요.');
    }

    if (
      user.phone !== phone &&
      (await this.userRepository.exists({ where: { phone } }))
    ) {
      throw new ConflictException('이미 등록된 연락처입니다.');
    }

    if (
      user.email !== email &&
      (await this.userRepository.exists({ where: { email } }))
    ) {
      throw new ConflictException('이미 등록된 이메일입니다.');
    }
  }
}
