import { IsBoolean, IsString, Length } from 'class-validator';
import { BaseModel } from 'src/common/entity/base.entity';
import { lengthValidationMessage } from 'src/common/validator/message/length-validation.message';
import { UserEntity } from 'src/user/entity/user.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';

@Entity()
export class TeamEntity extends BaseModel {
  @Column({ nullable: false })
  @IsString()
  @Length(2, 10, { message: lengthValidationMessage })
  name: string;

  @Column({ nullable: false })
  @IsString()
  @Length(2, 15, { message: lengthValidationMessage })
  community: string;

  @Column({ nullable: true })
  @IsString()
  @Length(2, 30, { message: lengthValidationMessage })
  description?: string;

  @OneToMany(() => UserEntity, user => user.team)
  member: UserEntity[];

  @OneToMany(() => UserEntity, user => user.applyTeam)
  applicants?: UserEntity[];

  @OneToOne(() => UserEntity, user => user.lead, {
    nullable: false,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  leader: UserEntity;

  @OneToOne(() => UserEntity, user => user.subLead, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  subLeader?: UserEntity;

  @Column({ nullable: false, default: false })
  @IsBoolean()
  isActive: boolean;

  @Column({ unique: true, nullable: false, default: false })
  @IsString()
  teamCode: string;
}
