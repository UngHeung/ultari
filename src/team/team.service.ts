import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entity/user.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateLeaderDto } from './dto/update-leader.dto';
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
      community: dto.community,
      description: dto.description,
      active: false,
      member: [user],
    });

    const newTeam = await this.teamRepository.save(team);
    return newTeam;
  }

  async getTeamById(id: number) {
    const findOption: FindOneOptions<TeamEntity> = {
      where: { id },
      relations: {
        member: true,
        leader: true,
        subLeader: true,
      },
    };

    const team = await this.getTeam(findOption);

    return team;
  }

  async getTeamListAll() {
    const teamList = await this.getTeamList();
    return teamList;
  }

  async changeLeader(dto: UpdateLeaderDto) {
    const team = await this.teamRepository.findOneBy({ id: dto.teamId });

    if (this.findTeamMember(team.member, dto.userId)) {
      throw new BadRequestException(`${team.name} 팀의 멤버가 아닙니다.`);
    }

    const user = await this.userRepository.findOneBy({ id: dto.userId });

    team.leader = user;
    this.teamRepository.save(team);
    return team.leader;
  }

  async changeSubLeader(applicant: UserEntity, dto: UpdateLeaderDto) {
    const teamFindOption: FindOneOptions<TeamEntity> = {
      where: {
        id: dto.teamId,
      },
      relations: {
        leader: true,
        subLeader: true,
        member: true,
      },
    };

    const team = await this.getTeam(teamFindOption);

    if (!team) {
      throw new BadRequestException('팀이 존재하지 않습니다.');
    }

    if (applicant.id !== team.leader.id) {
      throw new UnauthorizedException('권한이 없습니다. 팀 리더가 아닙니다.');
    }

    if (team.leader.id === dto.userId) {
      throw new BadRequestException('리더는 서브리더가 될 수 없습니다.');
    }

    if (!this.findTeamMember(team.member, dto.userId)) {
      throw new BadRequestException(`${team.name} (팀)의 멤버가 아닙니다.`);
    }

    if (!dto.userId) {
      team.subLeader = null;
    } else {
      const user = await this.userRepository.findOneBy({ id: dto.userId });

      if (!user) {
        team.subLeader = null;
        throw new BadRequestException('유저가 존재하지 않습니다.');
      }

      team.subLeader = user;
    }

    this.teamRepository.save(team);
    return team;
  }

  async addMember(leader: UserEntity, dto: { teamId: number; userId: number }) {
    const team = await this.teamRepository.findOne({
      where: { id: dto.teamId },
      relations: {
        leader: true,
        member: true,
      },
    });

    if (team.leader.id !== leader.id) {
      throw new UnauthorizedException('권한이 없습니다. 리더가 아닙니다.');
    }

    if (this.findTeamMember(team.member, dto.userId)) {
      throw new BadRequestException('이미 가입된 사용자입니다.');
    }

    const user = await this.userRepository.findOneBy({ id: dto.userId });

    if (user.team) {
      throw new BadRequestException('이미 가입된 목장이 있는 사용자입니다.');
    }

    team.member = [...team.member, user];
    this.teamRepository.save(team);
    return team.member;
  }

  findTeamMember(team: UserEntity[], userId: number) {
    const result = team.filter(member => member.id === userId).length;
    return result ? true : false;
  }

  async getTeam(findOption: FindOneOptions<TeamEntity>) {
    return await this.teamRepository.findOne({ ...findOption });
  }

  async getTeamList(findOption?: FindOneOptions<TeamEntity>) {
    return await this.teamRepository.find({ ...findOption });
  }
}
