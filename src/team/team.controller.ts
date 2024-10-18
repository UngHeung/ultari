import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { CreateTeamDto } from './dto/create-team.dto';
import { FindTeamDto } from './dto/find-team.dto';
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

  @Get('/find')
  @UseGuards(AccessTokenGuard)
  findTeam(@Query() query: FindTeamDto) {
    return this.teamService.findTeamList(query);
  }

  @Get('/')
  @UseGuards(AccessTokenGuard)
  getTeamListAll() {
    return this.teamService.getTeamAll();
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

  @Delete('/:id')
  @UseGuards(AccessTokenGuard)
  deleteTeam(@Req() req, @Param('id') id: number) {
    return this.teamService.deleteTeam(req.user, id);
  }
}
