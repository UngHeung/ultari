import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { nanoid } from 'nanoid';
import { UserEntity } from 'src/user/entity/user.entity';
import { FindOneOptions, Like, Repository } from 'typeorm';
import { CreateTeamDto } from './dto/create-team.dto';
import { FindTeamDto } from './dto/find-team.dto';
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

  /**
   * # POST
   * create team
   */
  async createTeam(user: UserEntity, dto: CreateTeamDto) {
    if (user.team) {
      throw new BadRequestException('이미 소속된 목장이 있습니다.');
    }

    const team = this.teamRepository.create({
      name: dto.name,
      community: dto.community,
      description: dto.description,
      leader: user,

      member: [user],
      isActive: false,
      teamCode: await this.generateTeamCode(dto.name),
    });

    const newTeam = await this.teamRepository.save(team);

    return newTeam;
  }

  /**
   * # GET
   * find team by keywords (name, community)
   */
  async findTeamList(dto: FindTeamDto) {
    const findOption: FindOneOptions<TeamEntity> = {
      where:
        dto.type === 'community'
          ? { community: Like(`%${dto.keyword}%`) }
          : dto.type === 'id'
            ? { id: dto.id }
            : { name: Like(`%${dto.keyword}%`) },
    };

    const findTeamList = this.getTeamList(findOption);

    return findTeamList;
  }

  /**
   * # Patch
   * change leader
   */
  async changeLeader(dto: UpdateLeaderDto) {
    const team = await this.teamRepository.findOneBy({ id: dto.teamId });

    if (this.existsMember(team.member, dto.userId)) {
      throw new BadRequestException(`${team.name} 팀의 멤버가 아닙니다.`);
    }

    const user = await this.userRepository.findOneBy({ id: dto.userId });

    team.leader = user;
    this.teamRepository.save(team);
    return team.leader;
  }

  /**
   * # Patch
   * change sub leader
   */
  async changeSubLeader(applicant: UserEntity, dto: UpdateLeaderDto) {
    const team = await this.getTeam({
      where: { id: dto.teamId },
      relations: { subLeader: true },
    });

    if (!team) {
      throw new NotFoundException('팀이 존재하지 않습니다.');
    }

    if (applicant.id !== team.leader.id) {
      throw new UnauthorizedException('권한이 없습니다. 팀 리더가 아닙니다.');
    }

    if (team.leader.id === dto.userId) {
      throw new BadRequestException('리더는 서브리더가 될 수 없습니다.');
    }

    if (!this.existsMember(team.member, dto.userId)) {
      throw new BadRequestException(`${team.name} (팀)의 멤버가 아닙니다.`);
    }

    if (!dto.userId) {
      team.subLeader = null;
    } else {
      const user = await this.userRepository.findOneBy({ id: dto.userId });

      if (!user) {
        throw new NotFoundException('유저가 존재하지 않습니다.');
      }

      team.subLeader = user;
    }

    this.teamRepository.save(team);
    return team;
  }

  /**
   * # Patch
   * join team
   */
  async addMember(leader: UserEntity, dto: { teamId: number; userId: number }) {
    const team = await this.teamRepository.findOne({
      where: { id: dto.teamId },
      relations: { leader: true, member: true },
    });

    if (team.leader.id !== leader.id) {
      throw new UnauthorizedException('권한이 없습니다. 리더가 아닙니다.');
    }

    if (this.existsMember(team.member, dto.userId)) {
      throw new ConflictException('이미 가입된 사용자입니다.');
    }

    const user = await this.userRepository.findOneBy({ id: dto.userId });

    if (user.team) {
      throw new ConflictException('이미 가입된 목장이 있는 사용자입니다.');
    }

    team.member = [...team.member, user];
    this.teamRepository.save(team);

    return team.member;
  }

  /**
   * # DELETE
   * delete team
   */
  async deleteTeam(user: UserEntity, teamId: number) {
    const team = await this.getTeam({ where: { id: teamId } });

    if (!user) {
      throw new BadRequestException('잘못된 요청입니다.');
    }

    if (!team) {
      throw new NotFoundException('팀이 존재하지 않습니다.');
    }

    if (user.id !== team.leader.id) {
      throw new UnauthorizedException('권한이 없습니다.');
    }

    await this.teamRepository.delete(team);

    return true;
  }

  /**
   * # Base GET
   * find team all
   */
  async getTeamAll(): Promise<TeamEntity[]> {
    return await this.teamRepository.find();
  }

  /**
   * # Base GET
   * find team
   */
  async getTeam(
    findOneOptions: FindOneOptions<TeamEntity>,
  ): Promise<TeamEntity> {
    const team = await this.teamRepository.findOne({
      ...findOneOptions,
      relations: { leader: true, member: true },
    });

    if (!team) {
      throw new NotFoundException('팀을 찾을 수 없습니다.');
    }

    return;
  }

  /**
   * # Base GET
   * get team list
   */
  async getTeamList(findOption?: FindOneOptions<TeamEntity>) {
    return await this.teamRepository.find({
      ...findOption,
      relations: { leader: true },
    });
  }

  /**
   * # Base GET
   * exists team by team code
   */
  async existsTeamCode(teamCode: string): Promise<boolean> {
    return await this.teamRepository.exists({ where: { teamCode } });
  }

  /**
   * # Base GET
   * exists team member
   */
  existsMember(team: UserEntity[], userId: number) {
    const findMember = team.filter(member => member.id === userId).length;
    return findMember ? true : false;
  }

  /**
   * Generator
   * generate team code
   */
  async generateTeamCode(teamName: string): Promise<string> {
    let code = `${teamName}-${nanoid(6)}`;

    while (await this.existsTeamCode(code)) {
      code = await this.generateTeamCode(teamName);
    }

    return;
  }
}
