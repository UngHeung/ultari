import { BadRequestException, Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { MulterModule } from '@nestjs/platform-express';
import { PUBLIC_FOLDER_PATH } from './const/path.const';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import * as multer from 'multer';
import { UserModule } from 'src/user/user.module';
import { multerModuleOptions } from './multer/file-upload.multer';

@Module({
  imports: [MulterModule.register(multerModuleOptions)],
  exports: [CommonService],
  controllers: [CommonController],
  providers: [CommonService],
})
export class CommonModule {}
