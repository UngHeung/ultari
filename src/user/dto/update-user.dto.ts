import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserProfileEntity } from '../entity/user-profile.entity';
import { PartialType } from '@nestjs/mapped-types';
import { UserEntity } from '../entity/user.entity';

export class UpdateUserDto extends PartialType(UserEntity) {
  @IsString()
  @IsNotEmpty()
  userPassword: string;

  @IsString()
  @IsOptional()
  userPhone?: string;

  @IsString()
  @IsOptional()
  userEmail?: string;

  @IsOptional()
  userProfile?: UserProfileEntity;
}
