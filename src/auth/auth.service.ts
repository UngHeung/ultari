import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserEntity } from '../user/entity/user.entity';
import { AuthSignUpDto } from './dto/auth-signup.dto';
import { AuthLoginDto } from './dto/auth-login.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(authSignUpDto: AuthSignUpDto): Promise<Pick<UserEntity, 'id' | 'userName' | 'userRole'>> {
    const userPassword = await this.encodePassword(authSignUpDto.userPassword);
    return await this.userService.createUser({
      ...authSignUpDto,
      userPassword,
    });
  }

  async loginUser(authLoginDto: AuthLoginDto): Promise<{ accessToken: string }> {
    const { userAccount, userPassword } = authLoginDto;
    const user = await this.userService.getUserByUserAccount(userAccount);

    if (!user || !(await bcrypt.compare(userPassword, user.userPassword))) throw new UnauthorizedException('아이디 또는 비밀번호를 확인해주세요.');

    return { accessToken: this.signToken(user) };
  }

  signToken(user: Pick<UserEntity, 'id' | 'userName' | 'userRole'>) {
    const payload = { sub: user.id, name: user.userName, role: user.userRole };
    return this.jwtService.sign(payload);
  }

  async encodePassword(userPassword: string) {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(userPassword, salt);
  }
}
