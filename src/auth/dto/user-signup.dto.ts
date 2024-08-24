import { IsNotEmpty, IsString } from 'class-validator';

export class UserSignupDto {
  @IsString()
  @IsNotEmpty()
  userAccount: string;
  @IsString()
  @IsNotEmpty()
  password: string;
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
