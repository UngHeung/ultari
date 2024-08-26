import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UpdateUserDto } from './dto/user-update.dto';
import { SignupUserDto } from './dto/user-signup.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  async createUser(signupUserDto: SignupUserDto): Promise<void> {
    const userPassword = await this.encodePassword(signupUserDto.userPassword);
    const user = this.userRepository.create({
      ...signupUserDto,
      userPassword,
      userRole: 'ROLE_USER',
    });

    try {
      await this.userRepository.save(user);
    } catch (error) {
      console.log(error);
      if (error.code === '23505') throw new ConflictException('이미 등록된 계정입니다.');
      else throw new InternalServerErrorException();
    }
  }

  async getUsers(): Promise<UserEntity[]> {
    const user = await this.userRepository.find();
    return user;
  }

  async getUserById(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException(`계정이 존재하지 않습니다. ID : ${id}`);
    return user;
  }

  async encodePassword(userPassword: string) {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(userPassword, salt);
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.getUserById(id);
    const { userPassword, userPhone, userEmail, userProfile }: UpdateUserDto = updateUserDto;

    if (!(await bcrypt.compare(userPassword, user.userPassword))) throw new BadRequestException();

    userPhone && (user.userPhone = userPhone);
    userEmail && (user.userEmail = userEmail);
    userProfile && (user.userProfile = userProfile);

    this.userRepository.save(user);

    return user;
  }
}
