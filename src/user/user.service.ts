import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthSignUpDto } from 'src/auth/dto/auth-signup.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /**
   * 1. receive user information
   * 2. check already registered account, email, phone
   * 3. save new user in user repository
   */
  async createUser(authSignUpDto: AuthSignUpDto) {
    const { userAccount, userEmail, userPhone }: AuthSignUpDto = authSignUpDto;
    const userExists = await this.userRepository.exists({
      where: [{ userAccount }, { userEmail }, { userPhone }],
    });

    if (userExists) {
      throw new ConflictException('중복된 값입니다.');
    }

    const newUser = this.userRepository.create(authSignUpDto);

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
    const user = await this.userRepository.findOne({ where: { id }, relations: ['userProfile'] });
    if (!user) throw new NotFoundException(`계정이 존재하지 않습니다. ID : ${id}`);
    return user;
  }

  /**
   * 1. receive user account
   * 2. get user by user account from user repostitory
   * 3. return user
   */
  async getUserByUserAccount(userAccount: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { userAccount } });
    return user;
  }

  /**
   * 1. receive data for update user information
   * 2. request get user by user id
   * 3. compare input password and stored password
   * 4. check duplicated user email and phone
   * 5. update data for target user
   * 6. save updated user
   */
  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.getUserById(id);
    const { userPassword, userPhone, userEmail, userProfile }: UpdateUserDto = updateUserDto;

    if (!(await bcrypt.compare(userPassword, user.userPassword))) {
      throw new UnauthorizedException('비밀번호를 확인해주세요.');
    }

    const userExists = await this.userRepository.exists({
      where: [{ userEmail }, { userPhone }],
    });

    if (userExists) {
      throw new ConflictException('중복된 값입니다.');
    }

    userPhone && (user.userPhone = userPhone);
    userEmail && (user.userEmail = userEmail);
    userProfile && (user.userProfile = userProfile);

    this.userRepository.save(user);

    return user;
  }
}
