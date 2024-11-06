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
import { UserService } from 'src/user/user.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateLeaderDto } from './dto/update-leader.dto';
import { TeamEntity } from './entity/team.entity';
import { TeamService } from './team.service';

@Controller('team')
export class TeamController {
  constructor(
    private readonly teamService: TeamService,
    private readonly userService: UserService,
  ) {}

  /**
   * # GET
   * find team detail by id
   */
  @Get('/:id')
  getTeamForDetail(@Param('id') id: number): Promise<TeamEntity> {
    return this.teamService.getTeamForDetail(id);
  }

  /**
   * # GET
   * find team list by keyword
   */
  @Get('/find')
  @UseGuards(AccessTokenGuard)
  findTeam(@Query() query: { keyword: string }): Promise<TeamEntity[]> {
    return this.teamService.findTeamList(query.keyword);
  }

  /**
   * # GET
   * get applicant list by team id
   */
  @Get('/:id/applicant')
  getApplicantList(@Param('id') id: number): Promise<TeamEntity> {
    return this.teamService.getTeamApplicants(id);
  }

  @Post('/')
  @UseGuards(AccessTokenGuard)
  createTeam(@Req() req, @Body() dto: CreateTeamDto): Promise<TeamEntity> {
    return this.teamService.createTeam(req.user, dto);
  }

  @Patch('/member/sign')
  @UseGuards(AccessTokenGuard)
  async addMember(
    @Req() req,
    @Body() dto: { teamId: number; userId: number },
  ): Promise<TeamEntity> {
    const result = await this.teamService.signMember(req.user, dto);
    await this.userService.cancelApplyTeam(req.user.id, dto.userId);
    return result;
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

  @Delete('/:id')
  @UseGuards(AccessTokenGuard)
  deleteTeam(@Req() req, @Param('id') id: number): Promise<boolean> {
    return this.teamService.deleteTeam(req.user, id);
  }

  @Delete('/member/resign')
  @UseGuards(AccessTokenGuard)
  deleteMember(
    @Req() req,
    @Body() dto: { teamId: number; userId: number },
  ): Promise<TeamEntity> {
    return this.teamService.resignMember(req.user, dto);
  }
}
