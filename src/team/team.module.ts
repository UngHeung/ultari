import { Module } from '@nestjs/common';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entity/user.entity';
import { TeamEntity } from './entity/team.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TeamEntity, UserEntity])],
  controllers: [TeamController],
  providers: [TeamService],
})
export class TeamModule {}
