import { PickType } from '@nestjs/mapped-types';
import { PostEntity } from '../entity/post.entity';

export class CreatePostDto extends PickType(PostEntity, [
  'title',
  'content',
  'visibility',
  'type',
]) {}
