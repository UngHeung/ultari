import { PartialType } from '@nestjs/mapped-types';
import { ProfileImageEntity } from '../entity/profile-image.entity';
import { UserEntity } from '../entity/user.entity';

export class CreateUserProfileDto extends PartialType(ProfileImageEntity) {
  newProfilePath?: string;
}
