import { IsNotEmpty, IsString } from 'class-validator';
import { UserProfileEntity } from '../entity/user-profile.entity';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  userPassword: string;

  @IsString()
  userPhone: string;

  @IsString()
  userEmail: string;

  userProfile: UserProfileEntity;
}
