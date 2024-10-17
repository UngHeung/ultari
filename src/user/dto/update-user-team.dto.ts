import { PartialType } from '@nestjs/mapped-types';
import { UserEntity } from '../entity/user.entity';
import { TeamEntity } from 'src/team/entity/team.entity';

export class UpdateUserTeamDto extends PartialType(UserEntity) {
  team?: TeamEntity;
  lead?: TeamEntity;
  subLead?: TeamEntity;

  isLeaderOrSubLeader?: boolean;
}
