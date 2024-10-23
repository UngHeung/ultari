import { PickType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { PostEntity } from '../entity/post.entity';
import { ContentTypeEnum, PublicEnum } from '../enum/post.enum';
import { CommentEntity } from 'src/comment/entity/comment.entity';

export class CreatePostDto extends PickType(PostEntity, [
  'title',
  'content',
  'visibility',
  'contentType',
  'comments',
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

  @IsString()
  @IsOptional()
  comments: CommentEntity<PostEntity>[] = [];
}
