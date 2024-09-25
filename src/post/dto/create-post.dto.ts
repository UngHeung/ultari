import { PickType } from '@nestjs/mapped-types';
import { PostEntity } from '../entity/post.entity';
import { IsOptional, IsString } from 'class-validator';
import { PostImageEntity } from '../entity/post-image.entity';
import { ContentTypeEnum, PublicEnum } from '../enum/post.enum';

export class CreatePostDto extends PickType(PostEntity, [
  'title',
  'content',
  'visibility',
  'contentType',
]) {
  @IsString({ each: true })
  @IsOptional()
  images?: string[] = [];

  @IsString()
  @IsOptional()
  comments?: string = '';

  @IsString()
  @IsOptional()
  visibility?: PublicEnum;

  @IsString()
  @IsOptional()
  contentType?: ContentTypeEnum;
}
