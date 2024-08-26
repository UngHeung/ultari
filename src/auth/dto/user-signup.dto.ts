import { IsNotEmpty, IsString } from 'class-validator';

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

  userProfile?: string; // string -> Profile
}
