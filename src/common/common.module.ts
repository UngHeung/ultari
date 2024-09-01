import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { MulterModule } from '@nestjs/platform-express';
import { multerModuleOptions } from './multer/file-upload.multer';

@Module({
  imports: [MulterModule.register(multerModuleOptions)],
  exports: [CommonService],
  controllers: [CommonController],
  providers: [CommonService],
})
export class CommonModule {}
