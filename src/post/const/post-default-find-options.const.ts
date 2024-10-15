import { FindManyOptions } from 'typeorm';
import { PostEntity } from '../entity/post.entity';

export const POST_DEFAULT_FIND_OPTIONS: FindManyOptions<PostEntity> = {
  relations: {
    author: {
      profile: true,
    },
    images: true,
    likers: true,
  },
};
