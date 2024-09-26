import { Body, Controller, Delete, Patch, Post, Req } from '@nestjs/common';
import { TeamService } from './team.service';

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post('/')
  createTeam(@Req() req) {
    return this.teamService.createTeam(req.user.id);
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
