import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { multerModuleOptions } from 'src/common/multer/file-upload.multer';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PUBLIC_FOLDER_PATH } from 'src/common/const/path.const';

@Module({
  imports: [
    MulterModule.register(multerModuleOptions),
    ServeStaticModule.forRoot({
      rootPath: PUBLIC_FOLDER_PATH,
      serveRoot: '/public',
    }),
    TypeOrmModule.forFeature([UserEntity]),
    forwardRef(() => AuthModule),
  ],
  exports: [UserService],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
