import { IsNotEmpty, IsString } from 'class-validator';
import { UserProfileEntity } from '../entity/user-profile.entity';

export class SignupUserDto {
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
