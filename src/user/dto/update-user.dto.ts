import { IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { UserEntity } from '../entity/user.entity';
import { ProfileImageEntity } from '../entity/profile-image.entity';

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
