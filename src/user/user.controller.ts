import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
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

  @Get('/myinfo')
  @UseGuards(AccessTokenGuard)
  getMyInfo(@Req() req) {
    return this.userService.getUserById(req.user.id);
  }

  @Get('/myinfo/team')
  @UseGuards(AccessTokenGuard)
  getMyInfoAndTeam(@Req() req, @Body() password: string) {
    return this.userService.getUserWithTeam(req.user.id);
  }

  @Get('/myinfo/post')
  @UseGuards(AccessTokenGuard)
  getMyINfoAndPost(@Req() req) {
    return this.userService.getUserWithPosts(req.user.id);
  }

  @Get('/myinfo/team-and-post')
  getUserWithTeamAndPosts(@Req() req) {
    return this.userService.getUserWithTeamAndPosts(req.user.id);
  }

  @Get('/:id')
  @UseGuards(AccessTokenGuard)
  getUserById(@Param('id') id: number) {
    return this.userService.getUserById(id);
  }

  @Patch('/:id')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor('userProfile'))
  updateUser(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.userService.updateUser(id, updateUserDto, file?.filename);
  }
}
