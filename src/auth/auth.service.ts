import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserEntity } from '../user/entity/user.entity';
import { AuthSignUpDto } from './dto/auth-signup.dto';
import { AuthLoginDto } from './dto/auth-login.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcryptjs';
import * as config from 'config';

const jwtConfig: { secret: string; accessExpiresIn: number; refreshExpiresIn: number } = config.get('jwt');

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(authSignUpDto: AuthSignUpDto): Promise<UserEntity> {
    const userPassword = await this.encodePassword(authSignUpDto.userPassword);
    return await this.userService.createUser({
      ...authSignUpDto,
      userPassword,
    });
  }

  async loginUser(authLoginDto: AuthLoginDto): Promise<{ accessToken: string; refreshToken: string }> {
    const { userAccount, userPassword } = authLoginDto;
    const user = await this.userService.getUserByUserAccount(userAccount);

    if (!user || !(await bcrypt.compare(userPassword, user.userPassword)))
      throw new UnauthorizedException('아이디 또는 비밀번호를 확인해주세요.');

    return { accessToken: this.signToken(user, true), refreshToken: this.signToken(user, false) };
  }

  signToken(user: UserEntity, isRefreshToken: boolean): string {
    const payload = {
      sub: user.id,
      name: user.userName,
      role: user.userRole,
      type: isRefreshToken ? 'refresh' : 'access',
    };
    return this.jwtService.sign(payload, {
      secret: jwtConfig.secret,
      expiresIn: isRefreshToken ? jwtConfig.refreshExpiresIn : jwtConfig.accessExpiresIn,
    });
  }

  async encodePassword(userPassword: string) {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(userPassword, salt);
  }
}
