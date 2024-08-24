import { IsNotEmpty, IsString } from 'class-validator';

export class UserLoginDto {
  @IsString()
  @IsNotEmpty()
  userAccount: string;
  @IsString()
  @IsNotEmpty()
  password: string;
}
