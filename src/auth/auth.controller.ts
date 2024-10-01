import {
  Body,
  Controller,
  Headers,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserEntity } from 'src/user/entity/user.entity';
import { AuthService } from './auth.service';
import { AuthSignUpDto } from './dto/auth-signup.dto';
import { BasicTokenGuard } from './guard/basic-token.guard';
import {
  AccessTokenGuard,
  RefreshTokenGuard,
} from './guard/bearer-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  registerUser(@Body() authSignupDto: AuthSignUpDto): Promise<UserEntity> {
    return this.authService.registerUser(authSignupDto);
  }

  @Post('/login/account')
  @UseGuards(BasicTokenGuard)
  loginUser(
    @Headers('authorization') rawToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const token = this.authService.extractToken(rawToken, false);
    const credentials = this.authService.decodeBasicToken(token);
    return this.authService.loginUser(credentials);
  }

  @Post('/reissue/access')
  @UseGuards(RefreshTokenGuard)
  reissueAccessToken(@Headers('authorization') rawToken: string) {
    const token = this.authService.extractToken(rawToken, true);
    const newToken = this.authService.reissueToken(token, false);

    return {
      accessToken: newToken,
    };
  }

  @Post('/reissue/refresh')
  @UseGuards(RefreshTokenGuard)
  reissueRefreshToken(@Headers('authorization') rawToken: string) {
    const token = this.authService.extractToken(rawToken, true);
    const newToken = this.authService.reissueToken(token, true);

    return {
      refreshToken: newToken,
    };
  }

  @Post('/logout')
  logoutUser(): { accessToken: string; refreshToken: string } {
    return this.authService.logoutUser();
  }

  @Post('/verify')
  @UseGuards(AccessTokenGuard)
  verifyPassword(
    @Req() req,
    @Body() data: { password: string },
  ): Promise<boolean> {
    const { password } = data;
    return this.authService.verifyPassword(req.user, password);
  }
}
