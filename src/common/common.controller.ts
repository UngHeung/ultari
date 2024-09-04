import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommonService } from './common.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';

@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Post('/image')
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(AccessTokenGuard)
  postImage(@UploadedFile() file?: Express.Multer.File) {
    return { fileName: file.filename };
  }

  @Post('/images')
  @UseInterceptors(FilesInterceptor('images'))
  @UseGuards(AccessTokenGuard)
  PostImages(@UploadedFiles() files?: Express.Multer.File[]) {
    const results = {
      fileNames: [],
    };

    for (let i = 0; i < files.length; i++) {
      results.fileNames.push(files[i].filename);
    }

    return results;
  }
}
