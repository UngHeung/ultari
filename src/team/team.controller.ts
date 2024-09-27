import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateLeaderDto } from './dto/update-leader.dto';
import { TeamService } from './team.service';

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post('/')
  @UseGuards(AccessTokenGuard)
  createTeam(@Req() req, @Body() dto: CreateTeamDto) {
    return this.teamService.createTeam(req.user, dto);
  }

  @Get('/:id')
  @UseGuards(AccessTokenGuard)
  getTeamById(@Param('id') id: number) {
    return this.teamService.getTeamById(id);
  }

  @Get('/')
  @UseGuards(AccessTokenGuard)
  getTeamListAll() {
    return this.teamService.getTeamListAll();
  }

  @Patch('/leader')
  @UseGuards(AccessTokenGuard)
  changeLeader(@Body() dto: UpdateLeaderDto) {
    return this.teamService.changeLeader(dto);
  }

  @Patch('/leader/sub')
  @UseGuards(AccessTokenGuard)
  changeSubLeader(@Req() req, @Body() dto: UpdateLeaderDto) {
    return this.teamService.changeSubLeader(req.user, dto);
  }

  @Patch('/member/sign')
  @UseGuards(AccessTokenGuard)
  addMember(@Req() req, @Body() dto: { teamId: number; userId: number }) {
    return this.teamService.addMember(req.user, dto);
  }

  @Patch('/member/resign')
  @UseGuards(AccessTokenGuard)
  deleteMember() {}

  @Delete('/')
  deleteTeam() {}
}
