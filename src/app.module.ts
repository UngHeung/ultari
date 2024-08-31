import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { getTypeOrmConfig } from './configs/typeorm.config';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(getTypeOrmConfig()),
    AuthModule,
    UserModule,
    CommonModule,
  ],
  providers: [{ provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor }],
})
export class AppModule {}
