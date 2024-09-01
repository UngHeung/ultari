import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { MulterModule } from '@nestjs/platform-express';
import { multerModuleOptions } from './multer/file-upload.multer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entity/user.entity';

@Module({
  imports: [MulterModule.register(multerModuleOptions), TypeOrmModule.forFeature([UserEntity])],
  exports: [CommonService],
  controllers: [CommonController],
  providers: [CommonService],
})
export class CommonModule {}
