import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
import { CreateTeamDto } from './dto/create-team.dto';
import { TeamEntity } from './entity/team.entity';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(TeamEntity)
    private readonly teamRepository: Repository<TeamEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createTeam(user: Omit<UserEntity, 'password'>, dto: CreateTeamDto) {
    const team = this.teamRepository.create({
      leader: user,
      name: dto.name,
      active: false,
      member: [],
    });

    const newTeam = await this.teamRepository.save(team);
    return newTeam;
  }

  async changeLeader(teamId: number, userId: number) {
    const team = await this.teamRepository.findOneBy({ id: teamId });
    const user = await this.userRepository.findOneBy({ id: userId });

    team.leader = user;
    this.teamRepository.save(team);
    return team.leader;
  }

  async changeSubLeader(
    applicant: UserEntity,
    teamId: number,
    userId?: number,
  ) {
    const team = await this.teamRepository.findOneBy({ id: teamId });
    if (applicant.id !== team.leader.id) {
      throw new UnauthorizedException('권한이 없습니다. 팀 리더가 아닙니다.');
    }

    const userExist = team.member.filter(member => member.id === userId);

    if (userExist) {
      throw new BadRequestException(`${team.name} 팀의 멤버가 아닙니다.`);
    }

    if (!userId) {
      team.leader = null;
    } else {
      const user = await this.userRepository.findOneBy({ id: userId });
      team.leader = user;
    }

    this.teamRepository.save(team);
    return team;
  }

  addMember(teamId: number, userId: number) {
    //
  }
}
