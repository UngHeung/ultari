import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
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

  /**
   * # GET
   * get post detail
   */
  @Get('/:id/detail/')
  async getPostById(@Param('id') id: string) {
    return this.postService.getPostDetailById(+id);
  }

  /**
   * # GET
   * find post list by keyword
   */
  @Get('/find')
  findPosts(@Query() query: { keyword: string }): Promise<PostEntity[]> {
    return this.postService.findPostList(query.keyword);
  }

  /**
   * # GET
   * post paginate
   * get post list
   */
  @Get('/pg')
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
    Logger.log(take);
    if (!(take + '').match(/^([1-9]|10)$/g)) {
      return;
    }

    const cursor = {
      id: +id,
      value: +value,
    };

    return await this.postService.cursorPaginatePost(
      +take,
      orderBy,
      sort ?? 'createAt',
      id ? cursor : null,
    );
  }

  /**
   * # GET
   * comment paginate
   * get comment list by post id
   */
  @Get('/:id/comments')
  async getPaginateComment(
    @Query()
    query: {
      take: string;
      id?: string;
    },
    @Param('id') postId: string,
  ): Promise<{
    data: PostCommentEntity[];
    nextCursor: { id: number; value: number };
  }> {
    const { take, id } = query;
    const cursor = {
      id: +id,
      value: +id,
    };

    return await this.postService.cursorPaginateComment(
      +postId,
      +take,
      id ? cursor : null,
    );
  }

  /**
   * # POST
   * create new post
   */
  @Post('/')
  @UseGuards(AccessTokenGuard)
  async createPost(
    @Req() req,
    @Body() dto: CreatePostDto,
  ): Promise<PostEntity> {
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

  /**
   * # POST
   * create new image
   */
  @Post('/image')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ fileName: string }> {
    const { fileName } = await this.postService.saveImage(file);
    return { fileName };
  }

  /**
   * # POST
   * create new image list
   */
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

  /**
   * # POST
   * create new comment
   */
  @Post('/comment')
  @UseGuards(AccessTokenGuard)
  async createComment(
    @Req() req,
    @Body() dto: { postId: number; content: string },
  ): Promise<PostCommentEntity> {
    return this.postService.createComment(req.user, dto);
  }

  /**
   * # PATCH
   * increase views
   */
  @Patch('/:id/views')
  @UseGuards(AccessTokenGuard)
  increaseViews(@Req() req, @Param('id') id: string): Promise<void> {
    return this.postService.increaseViews(req.user.id, +id);
  }

  /**
   * # PATCH
   * update post
   */
  @Patch('/:id')
  @UseGuards(AccessTokenGuard)
  updatePost(
    @Req() req,
    @Param('id') id: number,
    @Body() dto: UpdatePostDto,
  ): Promise<PostEntity> {
    return this.postService.updatePost(req.user, +id, dto);
  }

  /**
   * # PATCH
   * update like count
   */
  @Patch('/:id/likes')
  @UseGuards(AccessTokenGuard)
  updateLikes(@Req() req, @Param('id') id: string): Promise<number> {
    return this.postService.updateLikes(req.user, +id);
  }

  /**
   * # PATCH
   * update comment
   */
  @Patch('/comment/:id')
  @UseGuards(AccessTokenGuard)
  updateComment(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: { content: string },
  ): Promise<PostCommentEntity> {
    return this.postService.updateComment(req.user, +id, dto);
  }

  /**
   * # Delete
   * delete post
   */
  @Delete('/:id')
  @UseGuards(AccessTokenGuard)
  deletePost(@Req() req, @Param('id') id: string): Promise<boolean> {
    return this.postService.deletePost(req.user, +id);
  }

  /**
   * # DELETE
   * delete comment
   */
  @Delete('/comment/:id')
  @UseGuards(AccessTokenGuard)
  deleteComment(@Req() req, @Param('id') id: string): Promise<boolean> {
    return this.postService.deleteComment(req.user, +id);
  }
}
