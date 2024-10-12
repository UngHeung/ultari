import { Exclude } from 'class-transformer';
import { IsEmail, IsOptional, IsString, Length } from 'class-validator';
import { BaseModel } from 'src/common/entity/base.entity';
import { emailValidationMessage } from 'src/common/validator/message/email-validation.message';
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
  @Column({ unique: true })
  @IsString({ message: stringValidationMessage })
  @Length(6, 15, { message: lengthValidationMessage })
  account: string;

  @Column()
  @IsString({ message: stringValidationMessage })
  @Length(8, 20, { message: lengthValidationMessage })
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column()
  @IsString({ message: stringValidationMessage })
  @Length(2, 10, { message: lengthValidationMessage })
  name: string;

  @Column({ unique: true })
  @IsString({ message: stringValidationMessage })
  @Length(12, 13, { message: lengthValidationMessage })
  phone: string;

  @Column({ unique: true })
  @IsString({ message: stringValidationMessage })
  @IsEmail({}, { message: emailValidationMessage })
  email: string;

  @Column()
  @IsString({ message: stringValidationMessage })
  community?: string;

  @IsOptional()
  @OneToOne(() => ProfileImageEntity, profile => profile.user)
  @JoinColumn()
  profile?: ProfileImageEntity;

  @Column({
    enum: Object.values(RoleEnum),
    default: RoleEnum.USER,
  })
  role: string;

  @OneToMany(() => PostEntity, post => post.author)
  posts: PostEntity[];

  @ManyToMany(() => PostEntity, post => post.likers)
  likedPosts?: PostEntity[];

  @ManyToOne(() => TeamEntity, team => team.member)
  team: TeamEntity;

  @OneToOne(() => TeamEntity, team => team.leader)
  @JoinColumn()
  lead: TeamEntity;

  @OneToOne(() => TeamEntity, team => team.subLeader)
  @JoinColumn()
  subLead: TeamEntity;
}
