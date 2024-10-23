import { PickType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { PostCommentEntity } from '../entity/post-comment.entity';
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
  comments: PostCommentEntity[] = [];
}
