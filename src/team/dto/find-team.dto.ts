import { IsNumber, IsOptional, IsString } from 'class-validator';

export class FindTeamDto {
  @IsNumber()
  @IsOptional()
  id: number;

  @IsString()
  @IsOptional()
  keyword: string;

  @IsString()
  @IsOptional()
  type: 'name' | 'community' | 'id';
}
