import { PartialType } from '@nestjs/mapped-types';
import { PostEntity } from '../entity/post.entity';
import { IsOptional, IsString } from 'class-validator';
import { ContentTypeEnum, PublicEnum } from '../enum/post.enum';
import { PostImageEntity } from '../entity/post-image.entity';

export class UpdatePostDto extends PartialType(PostEntity) {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  visibility?: PublicEnum;

  @IsString()
  @IsOptional()
  type?: ContentTypeEnum;

  @IsString({ each: true })
  @IsOptional()
  images?: PostImageEntity[];
}
