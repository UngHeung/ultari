import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/user/entity/user.entity';
import { PostEntity } from './entity/post.entity';
import { PostImageEntity } from './entity/post-image.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { CreatePostImageDto } from './dto/create-post-image.dto';
import { CommonService } from 'src/common/common.service';
import { basename, join } from 'path';
import { promises } from 'fs';
import { POST_IMAGE_PATH, TEMP_FOLDER_PATH } from 'src/common/const/path.const';
import { POST_DEFAULT_FIND_OPTIONS } from './const/post-default-find-options.const';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(PostImageEntity)
    private readonly postImageRepository: Repository<PostImageEntity>,
    private readonly commonService: CommonService,
  ) {}

  /**
   * @param author
   * @param CreatePostDto
   * 1. request to create new post
   * 2. returns created new post
   */
  async createPost(
    author: UserEntity,
    dto: CreatePostDto,
  ): Promise<PostEntity> {
    const post = this.postRepository.create({
      ...dto,
      author,
      images: [] as PostImageEntity[],
    });

    const newPost = await this.postRepository.save(post);
    return newPost;
  }

  /**
   * @param id
   * 1. find post by id
   * 2. return post
   */
  async getPostById(id: number): Promise<PostEntity> {
    const post = await this.postRepository.findOne({
      ...POST_DEFAULT_FIND_OPTIONS,
      where: { id },
    });

    return post;
  }

  /**
   * @param id
   * @param UpdatePostDto
   * update post with received dto data
   * return new post
   */
  async updatePost(
    user: UserEntity,
    id: number,
    dto: UpdatePostDto,
  ): Promise<PostEntity> {
    const post = await this.postRepository.findOne({
      where: {
        author: { id: user.id },
        id,
      },
    });

    if (!post) {
      throw new UnauthorizedException('본인의 게시물이 아닙니다.');
    }

    dto.title && (post.title = dto.title);
    dto.content && (post.content = dto.content);
    dto.images && (post.images = dto.images);
    dto.visibility && (post.visibility = dto.visibility);
    dto.type && (post.type = dto.type);

    const newPost = this.postRepository.save(post);

    return newPost;
  }

  /**
   * @param id
   * delete post by post id
   * delete images files in folder
   */
  async deletePost(user: UserEntity, id: number): Promise<number> {
    const post: PostEntity & { images?: PostImageEntity[] } =
      await this.postRepository.findOne({
        where: {
          id: id,
          author: {
            id: user.id,
          },
        },
        relations: { images: true },
      });

    if (!post) throw new BadRequestException('본인의 게시물이 아닙니다.');

    const deleteResult = await this.postRepository.delete(id);

    if (!deleteResult.affected) {
      throw new NotFoundException(`삭제할 게시물이 없습니다. id : ${id}`);
    }

    for (let i = 0; i < post.images.length; i++) {
      this.commonService.removeFile(POST_IMAGE_PATH, post.images[i].path);
    }

    return id;
  }

  /**
   * @param CreatePostDto
   */
  createPostImage(dto: CreatePostImageDto) {
    const tempFilePath = join(TEMP_FOLDER_PATH, dto.path);
    const fileName = basename(tempFilePath);
    const newPath = join(POST_IMAGE_PATH, fileName);
    const result = this.postImageRepository.save(dto);

    promises.rename(tempFilePath, newPath);

    return result;
  }

  /**
   * @param PaginatePostDto
   * generate paginate
   */
  async paginatePosts(dto: PaginatePostDto): Promise<{
    data: PostEntity[];
    total?: number;
    cursor?: { after: number };
    count?: number;
    next?: string;
  }> {
    return this.commonService.paginate(
      dto,
      this.postRepository,
      { ...POST_DEFAULT_FIND_OPTIONS },
      'post',
    );
  }
}
