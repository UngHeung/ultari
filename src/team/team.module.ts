import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { TeamEntity } from './entity/team.entity';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TeamEntity]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
  ],
  controllers: [TeamController],
  providers: [TeamService],
})
export class TeamModule {}
