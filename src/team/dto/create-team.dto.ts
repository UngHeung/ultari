import { PickType } from '@nestjs/mapped-types';
import { TeamEntity } from '../entity/team.entity';
import { UserEntity } from 'src/user/entity/user.entity';
import { IsOptional, IsString } from 'class-validator';

export class CreateTeamDto extends PickType(TeamEntity, [
  'name',
  'description',
  'community',
]) {}
