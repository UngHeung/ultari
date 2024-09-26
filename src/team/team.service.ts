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
import { UpdateLeaderDto } from './dto/update-leader.dto';

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

  async changeLeader(dto: UpdateLeaderDto) {
    const team = await this.teamRepository.findOneBy({ id: dto.teamId });
    const user = await this.userRepository.findOneBy({ id: dto.userId });

    team.leader = user;
    this.teamRepository.save(team);
    return team.leader;
  }

  async changeSubLeader(applicant: UserEntity, dto: UpdateLeaderDto) {
    const team = await this.teamRepository.findOneBy({ id: dto.teamId });
    if (applicant.id !== team.leader.id) {
      throw new UnauthorizedException('권한이 없습니다. 팀 리더가 아닙니다.');
    }

    const userExist = team.member.filter(member => member.id === dto.userId);

    if (userExist) {
      throw new BadRequestException(`${team.name} 팀의 멤버가 아닙니다.`);
    }

    if (!dto.userId) {
      team.leader = null;
    } else {
      const user = await this.userRepository.findOneBy({ id: dto.userId });
      team.leader = user;
    }

    this.teamRepository.save(team);
    return team;
  }

  findTeamMember(team: UserEntity[], userId: number) {
    const result = team.filter(member => member.id === userId);
    return result ? true : false;
  }
}
