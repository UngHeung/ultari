import { PartialType } from '@nestjs/mapped-types';
import { PostEntity } from '../entity/post.entity';
import { IsOptional, IsString } from 'class-validator';
import { ImageEntity } from 'src/common/entity/image.entity';
import { ContentTypeEnum, PublicEnum } from '../enum/post.enum';

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
  images?: ImageEntity[];
}
