import { PickType } from '@nestjs/mapped-types';
import { ProfileImageEntity } from '../entity/profile-image.entity';

export class CreateProfileImageDto extends PickType(ProfileImageEntity, [
  'user',
  'path',
  'type',
]) {}
