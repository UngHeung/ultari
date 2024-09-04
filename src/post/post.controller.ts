import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
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
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('/')
  @UseGuards(AccessTokenGuard)
  createPost(@Req() req, @Body() dto: CreatePostDto) {
    return this.postService.createPost(req.user, dto);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FilesInterceptor('images'))
  uploadImage(@UploadedFiles() files: Express.Multer.File) {}

  @Get()
  @UseGuards(AccessTokenGuard)
  getPosts(@Query() query: PaginatePostDto): Promise<{
    data: PostEntity[];
    total?: number;
    cursor?: { after: number };
    count?: number;
    next?: string;
  }> {
    return this.postService.paginatePosts(query);
  }

  @Patch('/:id')
  @UseGuards(AccessTokenGuard)
  updatePost(
    @Req() req,
    @Param('id') id: number,
    @Body() dto: UpdatePostDto,
  ): Promise<PostEntity> {
    return this.postService.updatePost(req.user, +id, dto);
  }
}
