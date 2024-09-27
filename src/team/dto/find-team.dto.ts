import { IsOptional, IsString } from 'class-validator';

export class FindTeamDto {
  @IsString()
  @IsOptional()
  where__name__i_like?: string;

  @IsString()
  @IsOptional()
  where__community__i_like?: string;
}
