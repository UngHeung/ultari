import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { ImageTypeEnum } from 'src/common/enum/image.enum';
import { CreatePostDto } from './dto/create-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostEntity } from './entity/post.entity';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('/local')
  @UseGuards(AccessTokenGuard)
  async createPostLocal(@Req() req, @Body() dto: CreatePostDto) {
    const post = await this.postService.createPost(req.user, dto);

    for (let i = 0; i < dto.images.length; i++) {
      await this.postService.createPostImage({
        post,
        order: i,
        path: dto.images[i],
        type: ImageTypeEnum.POST_IMAGE,
      });
    }

    return await this.postService.getPostById(post.id);
  }

  @Post('/image')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@UploadedFile() file?: Express.Multer.File) {
    return { fileName: this.postService.saveImage(file) };
  }

  @Post('/images')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FilesInterceptor('files'))
  uploadImages(@UploadedFiles() files?: Express.Multer.File[]) {
    const result = {
      fileNames: [],
    };

    for (const file of files) {
      result.fileNames.push(this.postService.saveImage(file));
    }

    return result;
  }

  @Get('/')
  getPosts(@Query() query: PaginatePostDto): Promise<{
    data: PostEntity[];
    total?: number;
    cursor?: { after: number };
    count?: number;
    next?: string;
  }> {
    return this.postService.paginatePosts(query);
  }

  @Get('/:id')
  getPostById(@Param('id') id: string) {
    return this.postService.getPostById(+id);
  }

  @Patch('/:id')
  @UseGuards(AccessTokenGuard)
  updatePost(
    @Req() req,
    @Param('id') id: number,
    @Body() dto: UpdatePostDto,
  ): Promise<PostEntity> {
    return this.postService.updatePost(req.user, id, dto);
  }

  @Patch('/:id/views')
  @UseGuards(AccessTokenGuard)
  increaseViews(@Req() req, @Param('id') id: number): Promise<void> {
    return this.postService.increaseViews(req.user.id, id);
  }

  @Patch('/:id/likes')
  @UseGuards(AccessTokenGuard)
  updateLikes(@Req() req, @Param('id') id: number): Promise<number> {
    return this.postService.updateLikes(req.user, id);
  }

  @Delete('/:id')
  @UseGuards(AccessTokenGuard)
  deletePost(@Req() req, @Param('id') id: number): Promise<number> {
    return this.postService.deletePost(req.user, id);
  }
}
