import { PartialType, PickType } from '@nestjs/mapped-types';
import { UserEntity } from 'src/user/entity/user.entity';

export class AuthLoginDto extends PartialType(
  PickType(UserEntity, ['id', 'account', 'password']),
) {
  id?: number;
  account?: string;
  password?: string;
}
