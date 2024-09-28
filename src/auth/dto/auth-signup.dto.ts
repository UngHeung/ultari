import { PickType } from '@nestjs/mapped-types';
import { UserEntity } from 'src/user/entity/user.entity';

export class AuthSignUpDto extends PickType(UserEntity, [
  'account',
  'password',
  'name',
  'phone',
  'email',
  'profile',
]) {}
