import { ImageTypeEnum } from 'src/common/enum/image.enum';
import { UserEntity } from '../entity/user.entity';

export class CreateProfileImageDto {
  user: UserEntity;
  path: string;
  type: ImageTypeEnum = ImageTypeEnum.PROFILE_IMAGE;
}
