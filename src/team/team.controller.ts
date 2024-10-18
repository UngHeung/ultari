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
import { TeamEntity } from './entity/team.entity';
import { TeamService } from './team.service';

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post('/')
  @UseGuards(AccessTokenGuard)
  createTeam(@Req() req, @Body() dto: CreateTeamDto): Promise<TeamEntity> {
    return this.teamService.createTeam(req.user, dto);
  }

  @Get('/find')
  @UseGuards(AccessTokenGuard)
  findTeam(@Query() query: FindTeamDto): Promise<TeamEntity[]> {
    return this.teamService.findTeamList(query);
  }

  @Get('/:id')
  getTeamAndData(@Param('id') id: number): Promise<TeamEntity> {
    return this.teamService.getTeamAndTeamData(id);
  }

  @Get('/')
  getTeamListAll(): Promise<TeamEntity[]> {
    return this.teamService.getTeamAll();
  }

  @Get('/team/applicant/:id')
  getApplicantList(@Query('id') id: number): Promise<TeamEntity> {
    return this.teamService.getTeamAndJoinTeamApplicantList(id);
  }

  @Patch('/leader')
  @UseGuards(AccessTokenGuard)
  changeLeader(@Body() dto: UpdateLeaderDto): Promise<TeamEntity> {
    return this.teamService.changeLeader(dto);
  }

  @Patch('/leader/sub')
  @UseGuards(AccessTokenGuard)
  changeSubLeader(
    @Req() req,
    @Body() dto: UpdateLeaderDto,
  ): Promise<TeamEntity> {
    return this.teamService.changeSubLeader(req.user, dto);
  }

  @Patch('/member/sign')
  @UseGuards(AccessTokenGuard)
  addMember(
    @Req() req,
    @Body() dto: { teamId: number; userId: number },
  ): Promise<TeamEntity> {
    return this.teamService.signMember(req.user, dto);
  }

  @Patch('/member/resign')
  @UseGuards(AccessTokenGuard)
  deleteMember(
    @Req() req,
    @Body() dto: { teamId: number; userId: number },
  ): Promise<TeamEntity> {
    return this.teamService.unsignMember(req.user, dto);
  }

  @Delete('/:id')
  @UseGuards(AccessTokenGuard)
  deleteTeam(@Req() req, @Param('id') id: number): Promise<boolean> {
    return this.teamService.deleteTeam(req.user, id);
  }
}
