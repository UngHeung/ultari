import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { PostEntity } from './entity/post.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/user/entity/user.entity';
import { ImageEntity } from 'src/common/entity/image.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
  ) {}

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
   * 0. for development
   * 1. receive request
   * 2. find all posts
   * 3. return posts
   */
  async getPosts(): Promise<PostEntity[]> {
    const posts = await this.postRepository.find();

    return posts;
  }
}
