import { IsIn, IsNumber, IsOptional } from 'class-validator';
import { numberValidationMessage } from '../validator/message/type-validation.message';

export class BasePaginateDto {
  @IsNumber({}, { message: numberValidationMessage })
  @IsOptional()
  page?: number;

  @IsNumber({}, { message: numberValidationMessage })
  @IsOptional()
  where__id__more_than?: number;

  @IsNumber({}, { message: numberValidationMessage })
  @IsOptional()
  where__id__less_than?: number;

  @IsIn(['ASC', 'DESC'], { message: '정렬은 ASC 또는 DESC로 입력해주세요.' })
  @IsOptional()
  order__createAt?: 'ASC' | 'DESC' = 'ASC';

  @IsNumber({}, { message: numberValidationMessage })
  @IsOptional()
  take: number = 10;
}
