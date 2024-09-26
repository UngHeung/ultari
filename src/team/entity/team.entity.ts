import { IsBoolean, IsString } from 'class-validator';
import { BaseModel } from 'src/common/entity/base.entity';
import { UserEntity } from 'src/user/entity/user.entity';
import { Column, Entity, IsNull, OneToMany, OneToOne } from 'typeorm';

@Entity()
export class TeamEntity extends BaseModel {
  @Column()
  @IsString()
  name: string;

  @OneToMany(() => UserEntity, user => user.team)
  member: UserEntity[];

  @OneToOne(() => UserEntity, user => user.lead)
  leader: UserEntity;

  @OneToOne(() => UserEntity, user => user.subLead)
  subLeader?: UserEntity;

  @Column()
  @IsBoolean()
  active: boolean;
}
