import { Body, Controller, Delete, Patch, Post, Req } from '@nestjs/common';
import { TeamService } from './team.service';

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post('/')
  createTeam(@Req() req) {
    return this.teamService.createTeam(req.user.id);
  }
}
