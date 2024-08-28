import { IsNotEmpty, IsString } from 'class-validator';

export class AuthLoginDto {
  @IsString()
  @IsNotEmpty()
  userAccount: string;

  @IsString()
  @IsNotEmpty()
  userPassword: string;
}
