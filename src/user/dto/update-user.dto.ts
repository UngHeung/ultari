import { IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { UserEntity } from '../entity/user.entity';

export class UpdateUserDto extends PartialType(UserEntity) {
  @IsOptional()
  phone?: string;

  @IsOptional()
  email?: string;

  @IsOptional()
  profile?: string;

  @IsOptional()
  community?: string;
}
