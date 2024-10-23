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
import { memoryStorage } from 'multer';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { ImageTypeEnum } from 'src/common/enum/image.enum';
import { CreatePostDto } from './dto/create-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostCommentEntity } from './entity/post-comment.entity';
import { PostEntity } from './entity/post.entity';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('/')
  @UseGuards(AccessTokenGuard)
  async createPost(@Req() req, @Body() dto: CreatePostDto) {
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
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ fileName: string }> {
    const { fileName } = await this.postService.saveImage(file);
    return { fileName };
  }

  @Post('/images')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FilesInterceptor('images', 5, { storage: memoryStorage() }))
  async uploadImages(
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<{ fileNames: string[] }> {
    const fileNames = [];

    for (let i = 0; i < files.length; i++) {
      const data = await this.postService.saveImage(files[i]);
      fileNames.push(data.fileName);
    }

    return { fileNames };
  }

  @Post('/comment')
  @UseGuards(AccessTokenGuard)
  async createComment(
    @Req() req,
    @Body() dto: { postId: number; content: string },
  ): Promise<PostCommentEntity> {
    return this.postService.createComment(req.user, dto);
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

  @Get('/find')
  findPosts(@Query() query: { keyword: string }): Promise<PostEntity[]> {
    return this.postService.findPostList(query.keyword);
  }

  @Get('/:id')
  getPostById(@Param('id') id: string) {
    return this.postService.getPostById(+id);
  }

  @Get('/comment')
  @UseGuards(AccessTokenGuard)
  getAllCommentsByPostId(): Promise<PostCommentEntity[]> {
    return;
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
  deletePost(@Req() req, @Param('id') id: number): Promise<boolean> {
    return this.postService.deletePost(req.user, id);
  }
}
