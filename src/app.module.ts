import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AwsModule } from './aws/aws.module';
import { CommonModule } from './common/common.module';
import { PUBLIC_ROOT_FOLDER_PATH } from './common/const/path.const';
import { getTypeOrmConfig } from './configs/typeorm.config';
import { PostModule } from './post/post.module';
import { TeamModule } from './team/team.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(getTypeOrmConfig()),
    ServeStaticModule.forRoot({
      rootPath: PUBLIC_ROOT_FOLDER_PATH,
      serveRoot: '/public',
    }),
    AuthModule,
    UserModule,
    TeamModule,
    PostModule,
    CommonModule,
    AwsModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
  ],
})
export class AppModule {}
