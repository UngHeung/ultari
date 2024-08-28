import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/entity/user.entity';
import * as config from 'config';

const jwtConfig: { secret: string; expiresIn: number } = config.get('jwt');

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {
    super({
      secretOrKey: jwtConfig.secret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: { userAccount: string }) {
    const { userAccount } = payload;
    const user: UserEntity = await this.userRepository.findOneBy({
      userAccount,
    });

    if (!user) throw new UnauthorizedException();

    return user;
  }
}
