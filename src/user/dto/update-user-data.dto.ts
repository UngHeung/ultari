import { PartialType, PickType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';
import { UserEntity } from '../entity/user.entity';

export class UpdateUserDataDto extends PickType(UserEntity, [
  'phone',
  'email',
  'community',
]) {
  @IsOptional()
  newProfilePath?: string;
}
