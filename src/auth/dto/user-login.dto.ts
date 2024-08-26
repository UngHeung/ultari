import { IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @IsString()
  @IsNotEmpty()
  userAccount: string;
  @IsString()
  @IsNotEmpty()
  userPassword: string;
}
