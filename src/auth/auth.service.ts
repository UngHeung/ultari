import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/entity/user.entity';
import { Repository } from 'typeorm';
import { AuthSignUpDto } from './dto/auth-signup.dto';
import { AuthLoginDto } from './dto/auth-login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  async createUser(authSignUpDto: AuthSignUpDto): Promise<void> {
    const userPassword = await this.encodePassword(authSignUpDto.userPassword);
    const user = this.userRepository.create({
      ...authSignUpDto,
      userPassword,
    });

    try {
      await this.userRepository.save(user);
    } catch (error) {
      console.log(error);
      if (error.code === '23505') throw new ConflictException('이미 등록된 계정입니다.');
      else throw new InternalServerErrorException();
    }
  }

  async loginUser(authLoginDto: AuthLoginDto): Promise<{ accessToken: string }> {
    const { userAccount, userPassword } = authLoginDto;
    const user = await this.userRepository.findOneBy({ userAccount });

    if (user && (await bcrypt.compare(userPassword, user.userPassword))) {
      const payload = { id: user.id, userName: user.userName, userRole: user.userRole };
      const accessToken = this.jwtService.sign(payload);
      return { accessToken };
    } else throw new UnauthorizedException('아이디 또는 비밀번호를 확인해주세요.');
  }

  //
  async encodePassword(userPassword: string) {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(userPassword, salt);
  }
}
