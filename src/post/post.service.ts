import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { PostEntity } from './entity/post.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/user/entity/user.entity';
import { UpdatePostDto } from './dto/update-post.dto';
import { POST_DEFAULT_FIND_OPTIONS } from './const/post-default-find-options.const';
import { CommonService } from 'src/common/common.service';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { PostImageEntity } from './entity/post-image.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
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
  async getPost(id: number): Promise<PostEntity> {
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
   */
  async deletePost(id: number): Promise<number> {
    const deleteResult = await this.postRepository.delete(id);

    if (!deleteResult.affected) {
      throw new NotFoundException(`삭제할 게시물이 없습니다. id : ${id}`);
    }

    return id;
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
