import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserSignupDto } from './dto/user-signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  createUser(@Body() userSignupDto: UserSignupDto): Promise<void> {
    return this.authService.createUser(userSignupDto);
  }

  @Get('/:id')
  getUser(@Param('id') id: number) {
    return this.authService.getUser(id);
  }
}
