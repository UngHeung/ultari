import {
  Body,
  Controller,
  Delete,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { CreateTeamDto } from './dto/create-team.dto';
import { TeamService } from './team.service';

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post('/')
  @UseGuards(AccessTokenGuard)
  createTeam(@Req() req, @Body() dto: CreateTeamDto) {
    return this.teamService.createTeam(req.user, dto);
  }

  @Patch('/leader')
  toggleLeader(@Body() userId: number, @Body() teamId: number) {
    return this.teamService.changeLeader(teamId, userId);
  }

  @Patch('/leader/sub')
  changeSubLeader(@Req() req, @Body() userId: number, @Body() teamId: number) {
    return this.teamService.changeSubLeader(req.user, teamId, userId);
  }

  @Patch('/member/sign')
  addMember(@Body() userId: number, @Body() teamId: number) {
    return this.teamService.addMember(teamId, userId);
  }

  @Patch('/member/resign')
  deleteMember() {}

  @Delete('/')
  deleteTeam() {}
}
