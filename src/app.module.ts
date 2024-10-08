import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { getTypeOrmConfig } from './configs/typeorm.config';
import { CommonModule } from './common/common.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PUBLIC_FOLDER_PATH } from './common/const/path.const';
import { PostModule } from './post/post.module';
import { TeamModule } from './team/team.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.dev',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(getTypeOrmConfig()),
    ServeStaticModule.forRoot({
      rootPath: PUBLIC_FOLDER_PATH,
      serveRoot: '/public',
    }),
    AuthModule,
    UserModule,
    TeamModule,
    PostModule,
    CommonModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
  ],
})
export class AppModule {}
