import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BasePaginateDto } from 'src/common/dto/base-paginate.dto';

export class PaginatePostDto extends BasePaginateDto {
  @IsNumber()
  @IsOptional()
  where__like_count__more_than?: number;

  @IsNumber()
  @IsOptional()
  where__view_count__more_than?: number;

  @IsString()
  @IsOptional()
  where__title__i_like?: string;
}
