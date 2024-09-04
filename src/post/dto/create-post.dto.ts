import { PickType } from '@nestjs/mapped-types';
import { PostEntity } from '../entity/post.entity';
import { IsOptional, IsString } from 'class-validator';
import { PostImageEntity } from '../entity/post-image.entity';

export class CreatePostDto extends PickType(PostEntity, [
  'title',
  'content',
  'visibility',
  'type',
]) {
  @IsString({ each: true })
  @IsOptional()
  images?: string[] = [];

  @IsString()
  @IsOptional()
  comments?: string = '';
}
