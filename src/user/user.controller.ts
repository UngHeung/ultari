import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { UpdateUserDataDto } from './dto/update-user-data.dto';
import { UserEntity } from './entity/user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/profile')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor('profile', { storage: memoryStorage() }))
  async uploadProfile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ fileName: string }> {
    const { fileName } = await this.userService.saveImage(file);

    return { fileName };
  }

  @Post('/team/join')
  @UseGuards(AccessTokenGuard)
  applyJoinTeam(@Req() req, @Body('id') id: number): Promise<UserEntity> {
    return this.userService.addJoinTeamApplicant(req.user.id, id);
  }

  @Get('/')
  @UseGuards(AccessTokenGuard)
  getUserAll(): Promise<UserEntity[]> {
    return this.userService.getUsersAll();
  }

  @Get('/myinfo')
  @UseGuards(AccessTokenGuard)
  getMyUserData(@Req() req): Promise<UserEntity> {
    return this.userService.getUserData(req.user.id);
  }

  @Get('/myinfo/team')
  @UseGuards(AccessTokenGuard)
  getMyInfoAndTeam(@Req() req): Promise<UserEntity> {
    return this.userService.getUserDataAndTeam(req.user.id);
  }

  @Get('/myinfo/post')
  @UseGuards(AccessTokenGuard)
  getMyInfoAndPost(@Req() req): Promise<UserEntity> {
    return this.userService.getUserDataAndPosts(req.user.id);
  }

  @Get('/:id')
  @UseGuards(AccessTokenGuard)
  getUserById(@Param('id') id: number): Promise<UserEntity> {
    return this.userService.getUserData(id);
  }

  @Patch('/')
  @UseGuards(AccessTokenGuard)
  async updateUser(
    @Req() req,
    @Body() dto: UpdateUserDataDto,
  ): Promise<UserEntity> {
    return this.userService.updateUserData(req.user, dto);
  }

  @Put('/team/cancel/:id')
  @UseGuards(AccessTokenGuard)
  async cancelApplyTeam(@Req() req, @Param('id') id: number) {
    return this.userService.cancelApplyTeam(req.user.id, id);
  }
}
