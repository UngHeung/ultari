import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { promises } from 'fs';
import { basename, join } from 'path';
import { CommonService } from 'src/common/common.service';
import { POST_IMAGE_PATH, TEMP_FOLDER_PATH } from 'src/common/const/path.const';
import { UserEntity } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
import { POST_DEFAULT_FIND_OPTIONS } from './const/post-default-find-options.const';
import { CreatePostImageDto } from './dto/create-post-image.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostImageEntity } from './entity/post-image.entity';
import { PostEntity } from './entity/post.entity';

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
      comments: '',
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
    dto.contentType && (post.contentType = dto.contentType);

    const newPost = this.postRepository.save(post);

    return newPost;
  }

  /**
   * @param userId
   * @param postId
   */
  async increaseViews(userId: number, postId: number): Promise<void> {
    const post = await this.getPostById(postId);

    if (userId === post.author.id) {
      throw new BadRequestException(
        '본인이 작성한 게시물의 조회수를 올릴 수 없습니다.',
      );
    }

    post.viewCount++;
    await this.postRepository.save(post);
  }

  /**
   * @param userId
   * @param postId
   */
  async updateLikes(user: UserEntity, postId: number): Promise<number> {
    const post = await this.postRepository.findOne({
      where: {
        id: postId,
      },
      relations: {
        author: true,
        likers: true,
      },
    });

    if (user.id === post.author.id) {
      throw new BadRequestException(
        '본인의 게시물에 좋아요를 누를 수 없습니다.',
      );
    }

    /**
     * @todo
     * 좋아요 누른 게시물 many to one 연결
     * 좋아요는 최대 1회만 가능하도록 설정
     */

    const exists = this.existsUserInLikers(user.id, post);

    post.likers = await this.saveOrDropPostLikers(user, post, !exists);
    post.likeCount = post.likers.length;

    await this.postRepository.save(post);

    return post.likeCount;
  }

  existsUserInLikers(userId: number, post: PostEntity): boolean {
    if (post.likers?.length <= 0) {
      return false;
    }

    for (const liker of post?.likers) {
      if (userId === liker.id) {
        return true;
      }
    }

    return false;
  }

  async saveOrDropPostLikers(
    user: UserEntity,
    post: PostEntity,
    isSaved: boolean,
  ): Promise<UserEntity[]> {
    if (post.likers?.length <= 0 || isSaved) {
      post.likers = [...post?.likers, user];
    } else {
      post.likers = post.likers.filter(liker => user.id !== liker.id);
    }

    return post.likers;
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
