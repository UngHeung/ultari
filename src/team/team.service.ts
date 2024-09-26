import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
import { TeamEntity } from './entity/team.entity';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(TeamEntity)
    private readonly teamRepository: Repository<TeamEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createTeam(id: number) {
    const user = await this.userRepository.findOneBy({ id });

    const team = this.teamRepository.create({
      leader: user,
      member: [],
      active: false,
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
