import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthSignUpDto } from './dto/auth-signup.dto';
import { AuthLoginDto } from './dto/auth-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  createUser(@Body() authSignupDto: AuthSignUpDto): Promise<void> {
    return this.authService.createUser(authSignupDto);
  }

  @Post('/login')
  loginUser(@Body() authLoginDto: AuthLoginDto): Promise<{ accessToken: string }> {
    return this.authService.loginUser(authLoginDto);
  }
}
