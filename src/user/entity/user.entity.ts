import { Exclude } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
} from 'class-validator';
import { BaseModel } from 'src/common/entity/base.entity';
import { formValidationMessage } from 'src/common/validator/message/form-validation.message';
import { lengthValidationMessage } from 'src/common/validator/message/length-validation.message';
import { stringValidationMessage } from 'src/common/validator/message/type-validation.message';
import { PostEntity } from 'src/post/entity/post.entity';
import { TeamEntity } from 'src/team/entity/team.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { ProfileImageEntity } from './profile-image.entity';

export enum RoleEnum {
  USER = 'ROLE_USER',
  SHEEP = 'ROLE_SHEEP',
  SHEPERD = 'ROLE_SHEPHERD',
  ADMIN = 'ROLE_ADMIN',
}

@Entity()
export class UserEntity extends BaseModel {
  @Column({ unique: true, nullable: false })
  @IsString({ message: stringValidationMessage })
  @Length(6, 15, { message: lengthValidationMessage })
  account: string;

  @Column({ nullable: false })
  @IsString({ message: stringValidationMessage })
  @Length(8, 20, { message: lengthValidationMessage })
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({ nullable: false })
  @IsString({ message: stringValidationMessage })
  @Length(2, 10, { message: lengthValidationMessage })
  name: string;

  @Column({ unique: true, nullable: false })
  @IsString({ message: stringValidationMessage })
  @Length(12, 13, { message: lengthValidationMessage })
  @IsPhoneNumber('KR', { message: formValidationMessage })
  phone: string;

  @Column({ unique: true, nullable: false })
  @IsString({ message: stringValidationMessage })
  @IsEmail({}, { message: formValidationMessage })
  email: string;

  @Column({ nullable: false })
  @IsString({ message: stringValidationMessage })
  community: string;

  @Column({
    enum: Object.values(RoleEnum),
    nullable: false,
    default: RoleEnum.USER,
  })
  role: string;

  @IsOptional()
  @OneToOne(() => ProfileImageEntity, profile => profile.user, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  profile?: ProfileImageEntity;

  @OneToMany(() => PostEntity, post => post.author)
  posts: PostEntity[];

  @ManyToMany(() => PostEntity, post => post.likers)
  likedPosts?: PostEntity[];

  @ManyToOne(() => TeamEntity, team => team.member)
  team: TeamEntity;

  @OneToOne(() => TeamEntity, team => team.leader, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  lead: TeamEntity;

  @OneToOne(() => TeamEntity, team => team.subLeader, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  subLead: TeamEntity;

  @Column({ nullable: false, default: false })
  @IsBoolean()
  isLoggedIn: boolean;

  @Column({ nullable: false, default: false })
  @IsBoolean()
  isLeaderOrSubLeader: boolean;

  @Column({ nullable: false, default: false })
  @IsBoolean()
  hasTeam: boolean;
}
