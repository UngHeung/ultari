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
import { ImageEntity } from 'src/common/entity/image.entity';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
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
      author,
      ...dto,
      images: [] as ImageEntity[],
    });

    const newPost = await this.postRepository.save(post);
    return newPost;
  }

  /**
   * [for development]
   * 1. find all posts
   * 2. return posts
   */
  async getPosts(): Promise<PostEntity[]> {
    const posts = await this.postRepository.find({
      relations: { author: true },
    });

    return posts;
  }

  /**
   * 1. find post by id
   * 2. return post
   */
  async getPost(id: number): Promise<PostEntity> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: { author: true },
    });

    return post;
  }

  /**
   * @param id
   * @param UpdatePostDto
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
}
