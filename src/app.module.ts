import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE } from './configs/const/config.const';
import { UserEntity } from './user/entity/user.entity';
import { UserProfileEntity } from './user/entity/user-profile.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env[DB_HOST],
      port: +process.env[DB_PORT],
      username: process.env[DB_USERNAME],
      password: process.env[DB_PASSWORD],
      database: process.env[DB_DATABASE],
      autoLoadEntities: true,
      entities: [UserEntity, UserProfileEntity],
      synchronize: true,
    }),
    AuthModule,
    UserModule,
  ],
  providers: [{ provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor }],
})
export class AppModule {}
