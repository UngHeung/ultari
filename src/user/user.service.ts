import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthLoginDto } from 'src/auth/dto/auth-login.dto';
import { AuthSignUpDto } from 'src/auth/dto/auth-signup.dto';
import { AwsService } from 'src/aws/aws.service';
import { ImageTypeEnum } from 'src/common/enum/image.enum';
import { TeamService } from 'src/team/team.service';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { UpdateUserDataDto } from './dto/update-user-data.dto';
import { ProfileImageEntity } from './entity/profile-image.entity';
import { UserEntity } from './entity/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileImageEntity)
    private readonly profileImageRepository: Repository<ProfileImageEntity>,
    @Inject(forwardRef(() => TeamService))
    private readonly teamService: TeamService,
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
   * # POST
   * add join team applicant
   */
  async addJoinTeamApplicant(
    userId: number,
    teamId: number,
  ): Promise<UserEntity> {
    const team = await this.teamService.getTeamById(teamId);
    const user = await this.getUserDataAndApplyTeam(userId);

    if (this.teamService.existsMember(team.member, userId)) {
      throw new BadRequestException('이미 가입된 사용자입니다.');
    }

    if (user.applyTeam && user.applyTeam.id === team.id) {
      throw new BadRequestException('이미 신청중인 사용자입니다.');
    }

    user.applyTeam = team;

    return await this.userRepository.save(user);
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
   * get user data
   */
  async getUserDataAndApplyTeam(id: number): Promise<UserEntity> {
    return await this.getUser({
      where: { id },
      relations: { applyTeam: true, profile: true },
    });
  }

  /**
   * # GET
   * get user and users team.
   */
  async getUserDataAndTeam(id: number): Promise<UserEntity> {
    return await this.getUser({
      where: { id },
      relations: { profile: true, team: true },
    });
  }

  /**
   * # GET
   * get user all data
   * relation props has only id
   */
  async getUserDataAll(id: number): Promise<UserEntity> {
    return await this.getUser({
      where: { id },
      relations: {
        profile: true,
        team: true,
        lead: true,
        subLead: true,
        applyTeam: true,
      },
      select: {
        profile: { id: true },
        team: { id: true },
        lead: { id: true },
        subLead: { id: true },
        applyTeam: { id: true },
      },
    });
  }

  /**
   * # GET
   * get user and users posts.
   */
  async getUserDataAndPosts(id: number): Promise<UserEntity> {
    return await this.getUser({
      where: { id },
      relations: { profile: true, posts: true },
    });
  }

  /**
   * # Put
   * cancel applyTeam
   */
  async cancelApplyTeam(
    userId: number,
    cancelUserid: number,
  ): Promise<UserEntity> {
    const user = await this.getUserDataAll(userId);
    const targetUser = await this.getUserDataAll(cancelUserid);

    if (user.id === targetUser.id) {
      user.applyTeam = null;
      return await this.userRepository.save(user);
    } else if (user.team?.id === targetUser.applyTeam?.id) {
      targetUser.applyTeam = null;
      return await this.userRepository.save(targetUser);
    } else {
      throw new UnauthorizedException('권한이 없습니다.');
    }
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
    const users = await this.getManyUsers({
      // relations: { profile: true },
    });

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
      relations: { profile: true },
      ...findOneOptions,
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
      relations: { profile: true },
      select: { password: false },
      ...findManyOptions,
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

    if (dto.profilePath) {
      if (user.profile) {
        await this.awsService.moveImage(
          `public/images/profile/${user.profile.path}`,
          `public/images/temp/${user.profile.path}`,
        );
      }

      const profile = this.createUserProfile(user, dto.profilePath);

      user.profile = profile;
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
