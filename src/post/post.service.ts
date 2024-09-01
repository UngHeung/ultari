import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from './entity/post.entity';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
  ) {}

  createPost(dto: CreatePostDto) {}

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
