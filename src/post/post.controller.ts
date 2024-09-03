import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PostEntity } from './entity/post.entity';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  createPost(@Body() dto: CreatePostDto) {
    console.log(dto);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  uploadImage(@UploadedFiles() files: Express.Multer.File) {}

  @Get()
  getPosts(): Promise<PostEntity[]> {
    return this.postService.getPosts();
  }
}
