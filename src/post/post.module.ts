import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entity/user.entity';
import { PostEntity } from './entity/post.entity';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { multerModuleOptions } from 'src/common/multer/file-upload.multer';
import { PUBLIC_FOLDER_PATH } from 'src/common/const/path.const';
import { AuthModule } from 'src/auth/auth.module';
import { CommonModule } from 'src/common/common.module';
import { PostImageEntity } from './entity/post-image.entity';

@Module({
  imports: [
    MulterModule.register(multerModuleOptions),
    ServeStaticModule.forRoot({
      rootPath: PUBLIC_FOLDER_PATH,
      serveRoot: '/public',
    }),
    TypeOrmModule.forFeature([PostEntity, UserEntity, PostImageEntity]),
    AuthModule,
    UserModule,
    CommonModule,
  ],
  exports: [PostService],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
