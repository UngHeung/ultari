import { forwardRef, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { AwsModule } from 'src/aws/aws.module';
import { PUBLIC_ROOT_FOLDER_PATH } from 'src/common/const/path.const';
import { multerModuleOptions } from 'src/common/multer/file-upload.multer';
import { PostCommentEntity } from 'src/post/entity/post-comment.entity';
import { PostEntity } from 'src/post/entity/post.entity';
import { TeamEntity } from 'src/team/entity/team.entity';
import { TeamModule } from 'src/team/team.module';
import { TeamService } from 'src/team/team.service';
import { ProfileImageEntity } from './entity/profile-image.entity';
import { UserEntity } from './entity/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    MulterModule.register(multerModuleOptions),
    ServeStaticModule.forRoot({
      rootPath: PUBLIC_ROOT_FOLDER_PATH,
      serveRoot: '/public',
    }),
    TypeOrmModule.forFeature([
      UserEntity,
      ProfileImageEntity,
      TeamEntity,
      PostEntity,
      PostCommentEntity,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => TeamModule),
    AwsModule,
  ],
  exports: [UserService],
  controllers: [UserController],
  providers: [UserService, TeamService],
})
export class UserModule {}
