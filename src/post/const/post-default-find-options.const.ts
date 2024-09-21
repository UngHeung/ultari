import { FindManyOptions } from 'typeorm';
import { PostEntity } from '../entity/post.entity';

export const POST_DEFAULT_FIND_OPTIONS: FindManyOptions<PostEntity> = {
  relations: {
    author: true,
    images: true,
    likers: true,
  },
};
