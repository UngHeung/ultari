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
import { UpdatePostDto } from './dto/update-post.dto';
import { PostCommentEntity } from './entity/post-comment.entity';
import { PostEntity } from './entity/post.entity';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('/list')
  async getPostList() {
    return this.postService.getPostList();
  }

  @Get('/:id/detail/')
  async getPostByIdTest(@Param('id') id: string) {
    return this.postService.getPostDetailById(+id);
  }

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

    return await this.postService.getPostDetailById(post.id);
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
  @UseInterceptors(FilesInterceptor('images', 3, { storage: memoryStorage() }))
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
  async getPaginatePost(
    @Query()
    query: {
      take: string;
      orderBy: 'ASC' | 'DESC';
      sort?: string;
      id?: string;
      value?: string;
    },
  ): Promise<{
    data: PostEntity[];
    nextCursor: { id: number; value: number };
  }> {
    const { take, orderBy, sort, id, value } = query;
    const cursor = {
      id: +id,
      value: +value,
    };

    return await this.postService.cursorPaginatePost(
      typeof +take === 'number' ? +take : 10,
      orderBy,
      sort ?? 'createAt',
      id ? cursor : null,
    );
  }

  @Get('/:id/comments')
  async getPaginateComment(
    @Query()
    query: {
      take: string;
      id?: string;
      value?: string;
    },
    @Param('id') postId: string,
  ): Promise<{
    data: PostCommentEntity[];
    nextCursor: { id: number; value: number };
  }> {
    const { take, id, value } = query;
    const cursor = {
      id: +id,
      value: +value,
    };

    return await this.postService.cursorPaginateComment(
      +postId,
      +take,
      id ? cursor : null,
    );
  }

  @Get('/find')
  findPosts(@Query() query: { keyword: string }): Promise<PostEntity[]> {
    return this.postService.findPostList(query.keyword);
  }

  @Get('/:id/comment/')
  @UseGuards(AccessTokenGuard)
  getAllCommentsByPostId(
    @Param('id') id: number,
  ): Promise<PostCommentEntity[]> {
    return this.postService.getCommentsByPostId(id);
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

  @Patch('/comment/:id')
  @UseGuards(AccessTokenGuard)
  updateComment(
    @Req() req,
    @Param('id') id: number,
    @Body() dto: { content: string },
  ): Promise<PostCommentEntity> {
    return this.postService.updateComment(req.user, id, dto);
  }

  @Delete('/:id')
  @UseGuards(AccessTokenGuard)
  deletePost(@Req() req, @Param('id') id: number): Promise<boolean> {
    return this.postService.deletePost(req.user, id);
  }

  @Delete('/comment/:id')
  @UseGuards(AccessTokenGuard)
  deleteComment(@Req() req, @Param('id') id: number): Promise<boolean> {
    return this.postService.deleteComment(req.user, id);
  }
}
