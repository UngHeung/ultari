import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthSignUpDto } from './dto/auth-signup.dto';
import { AuthLoginDto } from './dto/auth-login.dto';
import { UserEntity } from 'src/user/entity/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  registerUser(@Body() authSignupDto: AuthSignUpDto): Promise<Pick<UserEntity, 'id' | 'userName' | 'userRole'>> {
    return this.authService.registerUser(authSignupDto);
  }

  @Post('/login')
  loginUser(@Body() authLoginDto: AuthLoginDto): Promise<{ accessToken: string }> {
    return this.authService.loginUser(authLoginDto);
  }
}
