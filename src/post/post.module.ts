import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { AwsModule } from 'src/aws/aws.module';
import { CommonModule } from 'src/common/common.module';
import { PUBLIC_ROOT_FOLDER_PATH } from 'src/common/const/path.const';
import { multerModuleOptions } from 'src/common/multer/file-upload.multer';
import { UserEntity } from 'src/user/entity/user.entity';
import { UserModule } from 'src/user/user.module';
import { PostImageEntity } from './entity/post-image.entity';
import { PostEntity } from './entity/post.entity';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { PostCommentEntity } from './entity/post-comment.entity';

@Module({
  imports: [
    MulterModule.register(multerModuleOptions),
    ServeStaticModule.forRoot({
      rootPath: PUBLIC_ROOT_FOLDER_PATH,
      serveRoot: '/public',
    }),
    TypeOrmModule.forFeature([
      PostEntity,
      UserEntity,
      PostImageEntity,
      PostCommentEntity,
    ]),
    AuthModule,
    UserModule,
    CommonModule,
    AwsModule,
  ],
  exports: [PostService],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
