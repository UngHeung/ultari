import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
import { TeamEntity } from './entity/team.entity';

@Injectable()
export class TeamService {
  constructor() {}
}
