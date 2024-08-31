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

  /**
   * 1. receive user information
   * 2. request encrypt password
   * 3. store encrypted password in user
   * 4. request create new user
   */
  async registerUser(authSignUpDto: AuthSignUpDto): Promise<UserEntity> {
    const userPassword = await this.encodePassword(authSignUpDto.userPassword);

    return await this.userService.createUser({
      ...authSignUpDto,
      userPassword,
    });
  }

  /**
   * 1. receive user account and password
   * 2. validate user account and password
   * 3. request token
   * 4. return access token and refresh tokens
   */
  async loginUser(authLoginDto: AuthLoginDto): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.authenticateAccountAndPassword(authLoginDto);

    return { accessToken: this.signToken(user, false), refreshToken: this.signToken(user, true) };
  }

  /**
   *
   */
  async authenticateAccountAndPassword(user: AuthLoginDto): Promise<UserEntity> {
    const existsUser = await this.userService.getUserByUserAccount(user.userAccount);

    if (!existsUser) {
      throw new UnauthorizedException('존재하지 않는 사용자입니다.');
    }

    const passOk = await bcrypt.compare(user.userPassword, existsUser.userPassword);

    if (!passOk) {
      throw new UnauthorizedException('아이디 또는 비밀번호를 확인해주세요.');
    }

    return existsUser;
  }

  /**
   * 1. receive user
   * 2. store information in payload
   * 3. return token
   */
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

  /**
   * 1. receive header and type of token (Bearer or Basic)
   * 2. extract token from header
   * 3. validate token
   * 4. return token
   */
  extractToken(header: string, isBearer: boolean) {
    const split = header.split(' ');
    const prefix = isBearer ? 'Bearer' : 'Basic';

    if (split.length !== 2 || split[0] !== prefix) {
      throw new UnauthorizedException('잘못된 토큰입니다.');
    }

    const token = split[1];

    return token;
  }

  /**
   * 1. receive token
   * 2. verify token
   */
  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, { secret: jwtConfig.secret });
    } catch (error) {
      throw new UnauthorizedException('만료되었거나 잘못된 토큰입니다.');
    }
  }

  /**
   * 1. receive basic token
   * 2. decode basic token
   * 3. extract user account and password
   * 4. return decoded user account and password
   */
  decodeBasicToken(basicToken: string) {
    const decode = Buffer.from(basicToken, 'base64').toString('utf-8');
    const split = decode.split(':');

    if (split.length !== 2) {
      throw new UnauthorizedException('잘못된 토큰입니다.');
    }

    const [userAccount, userPassword] = split;

    return { userAccount, userPassword };
  }

  /**
   * 1. receive refresh token and type of token
   * 2. request verify token
   * 3. return new access token and refresh token
   */
  reissueToken(token: string, isRefreshToken: boolean) {
    const decoded = this.verifyToken(token);

    if (decoded.type !== 'refresh') {
      throw new UnauthorizedException('Refresh 토큰으로만 토큰 재발급이 가능합니다.');
    }

    return this.signToken({ ...decoded }, isRefreshToken);
  }

  /**
   * 1. receive password
   * 2. encrypt password
   * 3. return encrypted password
   */
  async encodePassword(userPassword: string) {
    const salt = await bcrypt.genSalt();

    return await bcrypt.hash(userPassword, salt);
  }
}
