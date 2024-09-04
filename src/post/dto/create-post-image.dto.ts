import { PickType } from '@nestjs/mapped-types';
import { PostImageEntity } from '../entity/post-image.entity';

export class CreatePostImageDto extends PickType(PostImageEntity, [
  'order',
  'path',
  'post',
  'type',
]) {}
