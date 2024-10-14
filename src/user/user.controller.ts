import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { ImageTypeEnum } from 'src/common/enum/image.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entity/user.entity';
import { UserService } from './user.service';

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
  getMyInfoAndTeam(@Req() req) {
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

  @Post('/profile')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor('profile', { storage: memoryStorage() }))
  async uploadProfile(@UploadedFile() file: Express.Multer.File) {
    const { fileName } = await this.userService.saveImage(file);

    console.log('fileName : ', fileName);

    return { fileName };
  }

  @Patch('/')
  @UseGuards(AccessTokenGuard)
  async updateUser(@Req() req, @Body() dto: UpdateUserDto) {
    const user = await this.userService.updateUser(req.user, dto);

    if (dto.path) {
      await this.userService.createProfileImage({
        user,
        path: dto.path,
        type: ImageTypeEnum.PROFILE_IMAGE,
      });
    }

    return await this.userService.getUserById(req.user.id);
  }
}
