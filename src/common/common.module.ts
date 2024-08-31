import { BadRequestException, Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { MulterModule } from '@nestjs/platform-express';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import * as multer from 'multer';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 5 * 125000,
      },
      fileFilter: (request, file, callback) => {
        const ext = extname(file.originalname);

        if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png' && ext !== '.gif') {
          return callback(new BadRequestException('업로드 가능한 확장자 : [jpg, jpeg, png, gif]'), false);
        }

        return callback(null, true);
      },
      storage: multer.diskStorage({
        destination: (request, response, callback) => {
          callback(null, '/public/profile');
        },
        filename: (request, file, callback) => {
          callback(null, `${uuid()}${extname(file.originalname)}`);
        },
      }),
    }),
  ],
  exports: [CommonService],
  controllers: [CommonController],
  providers: [CommonService],
})
export class CommonModule {}
