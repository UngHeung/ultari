import { BadRequestException } from '@nestjs/common';
import { MulterModuleOptions } from '@nestjs/platform-express';
import { PROFILE_IMAGE_PATH } from '../const/path.const';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import * as multer from 'multer';

export const multerModuleOptions: MulterModuleOptions = {
  limits: {
    fileSize: 5 * 125000,
  },
  fileFilter: (request, file, callback) => {
    const ext = extname(file.originalname);

    if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png' && ext !== '.gif') {
      return callback(
        new BadRequestException('업로드 가능한 확장자 : [jpg, jpeg, png, gif]'),
        false,
      );
    }

    return callback(null, true);
  },
  storage: multer.diskStorage({
    destination: (request, response, callback) => {
      callback(null, PROFILE_IMAGE_PATH);
    },
    filename: (request, file, callback) => {
      callback(null, `${uuid()}${extname(file.originalname)}`);
    },
  }),
};
