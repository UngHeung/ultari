import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthSignUpDto } from './dto/auth-signup.dto';
import { AuthLoginDto } from './dto/auth-login.dto';
import { UserEntity } from 'src/user/entity/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  registerUser(@Body() authSignupDto: AuthSignUpDto): Promise<UserEntity> {
    return this.authService.registerUser(authSignupDto);
  }

  @Post('/login')
  loginUser(@Body() authLoginDto: AuthLoginDto): Promise<{ accessToken: string }> {
    return this.authService.loginUser(authLoginDto);
  }

  @Post('/reissue/access')
  @UseGuards()
  reissueAccessToken(@Headers('authorization') rawToken: string) {
    const token = this.authService.extractToken(rawToken, true);
    const newToken = this.authService.reissueToken(token, false);

    return {
      accessToken: newToken,
    };
  }

  @Post('/reissue/refresh')
  @UseGuards()
  reissueRefreshToken(@Headers('authorization') rawToken: string) {
    const token = this.authService.extractToken(rawToken, false);
    const newToken = this.authService.reissueToken(token, false);

    return {
      refreshToken: newToken,
    };
  }
}
