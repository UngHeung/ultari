import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';
import { UserEntity } from '../entity/user.entity';

export class UpdateUserDto extends PartialType(UserEntity) {
  @IsOptional()
  phone?: string;

  @IsOptional()
  email?: string;

  @IsOptional()
  path?: string;

  @IsOptional()
  community?: string;
}
