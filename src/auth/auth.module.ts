import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entity/user.entity';
import { JwtStrategy } from './jwt.strategy';
import * as config from 'config';
import { UserProfileEntity } from '../user/entity/user-profile.entity';
import { UserService } from 'src/user/user.service';

const jwtConfig: { secret: string; accessExpiresIn: number; refreshExpiresIn: number } = config.get('jwt');
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtConfig.secret,
    }),
    TypeOrmModule.forFeature([UserEntity, UserProfileEntity]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, UserService],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
