import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthSignUpDto } from 'src/auth/dto/auth-signup.dto';
import { PROFILE_IMAGE_PATH } from 'src/common/const/path.const';
import { CommonService } from 'src/common/common.service';
import * as bcrypt from 'bcryptjs';

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
    const user = await this.userRepository.find();
    return user;
  }

  /**
   * 1. receive user id
   * 2. get user by user id from user repository
   * 3. return user
   */
  async getUserById(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user)
      throw new NotFoundException(`계정이 존재하지 않습니다. ID : ${id}`);
    return user;
  }

  /**
   * 1. receive user account
   * 2. get user by user account from user repostitory
   * 3. return user
   */
  async getUserByUserAccount(account: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { account } });
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
    id: number,
    updateUserDto: UpdateUserDto,
    userProfile: string,
  ): Promise<UserEntity> {
    const user = await this.getUserById(id);
    const { password, phone, email }: UpdateUserDto = updateUserDto;

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('비밀번호를 확인해주세요.');
    }

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

    if (userProfile) {
      user.profilePath &&
        this.commonService.removeFile(PROFILE_IMAGE_PATH, user.profilePath);
      user.profilePath = userProfile;
    }

    this.userRepository.save(user);

    return user;
  }
}
