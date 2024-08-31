import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UserEntity } from './entity/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  @UseGuards()
  getUsers(): Promise<UserEntity[]> {
    return this.userService.getUsers();
  }

  @Get('/:id')
  @UseGuards()
  getUserById(@Param('id') id: number) {
    return this.userService.getUserById(id);
  }

  @Patch('/:id')
  @UseGuards()
  updateUser(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(id, updateUserDto);
  }
}
