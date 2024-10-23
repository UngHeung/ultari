import { PickType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { PostCommentEntity } from '../entity/post-comment.entity';
import { PostEntity } from '../entity/post.entity';
import { ContentTypeEnum, PublicEnum } from '../enum/post.enum';

export class CreatePostDto extends PickType(PostEntity, [
  'title',
  'content',
  'visibility',
  'contentType',
]) {
  @IsString()
  @IsOptional()
  contentType?: ContentTypeEnum;

  @IsString()
  @IsOptional()
  visibility?: PublicEnum;

  @IsString({ each: true })
  @IsOptional()
  images?: string[] = [];
}
