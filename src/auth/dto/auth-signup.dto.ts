import { IsNotEmpty, IsString } from 'class-validator';
import { UserProfileEntity } from '../../user/entity/user-profile.entity';

export class AuthSignUpDto {
  @IsString()
  @IsNotEmpty()
  userAccount: string;

  @IsString()
  @IsNotEmpty()
  userPassword: string;

  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsString()
  @IsNotEmpty()
  userPhone: string;

  @IsString()
  @IsNotEmpty()
  userEmail: string;

  userProfile?: UserProfileEntity; // string -> Profile
}
