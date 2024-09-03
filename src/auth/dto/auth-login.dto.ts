import { PickType } from '@nestjs/mapped-types';
import { UserEntity } from 'src/user/entity/user.entity';

export class AuthLoginDto extends PickType(UserEntity, [
  'account',
  'password',
]) {}
