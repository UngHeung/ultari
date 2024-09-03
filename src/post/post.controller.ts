import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PostEntity } from './entity/post.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('/')
  @UseGuards(AccessTokenGuard)
  createPost(@Req() req, @Body() dto: CreatePostDto) {
    this.createPost(req.user, dto);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  uploadImage(@UploadedFiles() files: Express.Multer.File) {}

  @Get()
  getPosts(): Promise<PostEntity[]> {
    return this.postService.getPosts();
  }
}
