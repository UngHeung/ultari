import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserEntity } from '../user/entity/user.entity';
import { AuthSignUpDto } from './dto/auth-signup.dto';
import { AuthLoginDto } from './dto/auth-login.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import {
  JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  JWT_SECRET,
} from 'src/configs/const/config.const';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * @param AuthSignUpDto
   * 1. request encrypt password
   * 2. store encrypted password in user
   * 3. request create new user
   */
  async registerUser(dto: AuthSignUpDto): Promise<UserEntity> {
    const password = await this.encodePassword(dto.password);

    return await this.userService.createUser({
      ...dto,
      password,
    });
  }

  /**
   * @param account
   * @param password
   * 1. validate account and password
   * 2. request token
   * 3. return access token and refresh tokens
   */
  async loginUser(
    dto: AuthLoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.authenticateAccountAndPassword(dto);

    return {
      accessToken: this.signToken(user, false),
      refreshToken: this.signToken(user, true),
    };
  }

  /**
   * 1. request remove token
   * 2. return disabled token
   */
  logoutUser(): { accessToken: string; refreshToken: string } {
    return {
      accessToken: this.removeToken(),
      refreshToken: this.removeToken(),
    };
  }

  /**
   *
   */
  async authenticateAccountAndPassword(dto: AuthLoginDto): Promise<UserEntity> {
    const existsUser = await this.userService.getUserByUserAccount(dto.account);

    if (!existsUser) {
      throw new UnauthorizedException('존재하지 않는 사용자입니다.');
    }

    const passOk = await bcrypt.compare(dto.password, existsUser.password);

    if (!passOk) {
      throw new UnauthorizedException('아이디 또는 비밀번호를 확인해주세요.');
    }

    return existsUser;
  }

  /**
   * @param UserEntity
   * 1. store information in payload
   * 2. return token
   */
  signToken(user: UserEntity, isRefreshToken: boolean): string {
    const payload = {
      sub: user.id,
      name: user.name,
      role: user.role,
      type: isRefreshToken ? 'refresh' : 'access',
    };

    return this.jwtService.sign(payload, {
      secret: process.env[JWT_SECRET],
      expiresIn: isRefreshToken
        ? +process.env[JWT_ACCESS_EXPIRES_IN]
        : +process.env[JWT_REFRESH_EXPIRES_IN],
    });
  }

  /**
   * 1. remove payload data
   * 2. set token expires time to 0
   */
  removeToken() {
    const payload = {};
    return this.jwtService.sign(payload, {
      secret: process.env[JWT_SECRET],
      expiresIn: 0,
    });
  }

  /**
   * @param headers
   * @param isBearer
   * 1. extract token from header
   * 2. validate token
   * 3. return token
   */
  extractToken(headers: string, isBearer: boolean) {
    const split = headers.split(' ');
    const prefix = isBearer ? 'Bearer' : 'Basic';

    if (split.length !== 2 || split[0] !== prefix) {
      throw new UnauthorizedException('잘못된 토큰입니다.');
    }

    const token = split[1];

    return token;
  }

  /**
   * @param token
   * 1. verify token
   */
  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: process.env[JWT_SECRET],
        complete: true,
      });
    } catch (error) {
      throw new UnauthorizedException('만료되었거나 잘못된 토큰입니다.');
    }
  }

  /**
   * @param basicToken
   * 1. decode basic token
   * 2. extract user account and password
   * 3. return decoded user account and password
   */
  decodeBasicToken(basicToken: string) {
    const decode = Buffer.from(basicToken, 'base64').toString('utf-8');
    const split = decode.split(':');

    if (split.length !== 2) {
      throw new UnauthorizedException('잘못된 토큰입니다.');
    }

    const [account, password] = split;

    return { account, password };
  }

  /**
   * @param token
   * @param isRefreshToken
   * 1. request verify token
   * 2. return new access token and refresh token
   */
  reissueToken(token: string, isRefreshToken: boolean) {
    const decoded = this.verifyToken(token);

    const payload = {
      ...decoded.payload,
      id: decoded.payload.sub,
    };

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException(
        'Refresh 토큰으로만 토큰 재발급이 가능합니다.',
      );
    }

    return this.signToken(payload, isRefreshToken);
  }

  /**
   * @param password
   * 1. encrypt password
   * 2. return encrypted password
   */
  async encodePassword(userPassword: string) {
    const salt = await bcrypt.genSalt();

    return await bcrypt.hash(userPassword, salt);
  }
}
