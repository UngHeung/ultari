import { Body, Controller, Get, Param, Patch, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { UserEntity } from './entity/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  @UseGuards(AccessTokenGuard)
  getUsers(): Promise<UserEntity[]> {
    return this.userService.getUsers();
  }

  @Get('/:id')
  @UseGuards(AccessTokenGuard)
  getUserById(@Param('id') id: number) {
    return this.userService.getUserById(id);
  }

  @Patch('/:id')
  @UseInterceptors(FileInterceptor('userProfile'))
  @UseGuards(AccessTokenGuard)
  updateUser(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFiles() file?: Express.Multer.File,
  ) {
    console.log(file?.filename);
    return this.userService.updateUser(id, updateUserDto, file?.filename);
  }
}
