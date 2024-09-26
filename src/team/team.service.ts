import { Injectable } from '@nestjs/common';
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
}
