import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserEntity } from './entity/user.entity';
import { SignupUserDto } from './dto/user-signup.dto';
import { UpdateUserDto } from './dto/user-update.dto';
import { LoginUserDto } from './dto/user-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('/')
  getUsers(): Promise<UserEntity[]> {
    return this.authService.getUsers();
  }

  @Get('/:id')
  getUserById(@Param('id') id: number) {
    return this.authService.getUserById(id);
  }

  @Post('/signup')
  createUser(@Body() signupUserDto: SignupUserDto): Promise<void> {
    return this.authService.createUser(signupUserDto);
  }

  @Post('/login')
  loginUser(@Body() loginUserDto: LoginUserDto): Promise<{ accessToken: string }> {
    return this.authService.loginUser(loginUserDto);
  }

  @Patch('/:id')
  updateUser(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.authService.updateUser(id, updateUserDto);
  }
}
