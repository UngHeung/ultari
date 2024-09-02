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

  @IsIn(['ASC', 'DESC'], { message: '' })
  @IsOptional()
  order__createAt?: 'ASC' | 'DESC' = 'ASC';

  @IsNumber({}, { message: numberValidationMessage })
  @IsOptional()
  take: number = 20;
}
