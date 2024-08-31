import { IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { UserEntity } from '../entity/user.entity';

export class UpdateUserDto extends PartialType(UserEntity) {
  userPassword: string;

  @IsOptional()
  userPhone?: string;

  @IsOptional()
  userEmail?: string;

  @IsOptional()
  userProfilePath?: string;
}
