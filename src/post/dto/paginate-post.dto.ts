import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BasePaginateDto } from 'src/common/dto/base-paginate.dto';
import { ContentTypeEnum, PublicEnum } from '../enum/post.enum';

export class PaginatePostDto extends BasePaginateDto {
  @IsNumber()
  @IsOptional()
  where__likeCount__more_than?: number;

  @IsNumber()
  @IsOptional()
  where__viewCount__more_than?: number;

  @IsString()
  @IsOptional()
  where__title__i_like?: string;

  @IsString()
  @IsOptional()
  where__visibility?: PublicEnum;

  @IsString()
  @IsOptional()
  where__contentType?: ContentTypeEnum;
}
