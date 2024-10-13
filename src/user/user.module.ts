import { forwardRef, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { CommonModule } from 'src/common/common.module';
import { PUBLIC_ROOT_FOLDER_PATH } from 'src/common/const/path.const';
import { multerModuleOptions } from 'src/common/multer/file-upload.multer';
import { PostEntity } from 'src/post/entity/post.entity';
import { TeamEntity } from 'src/team/entity/team.entity';
import { TeamModule } from 'src/team/team.module';
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
      PostEntity,
      TeamEntity,
      ProfileImageEntity,
    ]),
    forwardRef(() => AuthModule),
    TeamModule,
    CommonModule,
  ],
  exports: [UserService],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
