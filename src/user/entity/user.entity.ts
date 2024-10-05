import { Exclude, Transform } from 'class-transformer';
import { IsEmail, IsString, Length } from 'class-validator';
import { join } from 'path';
import { PROFILE_IMAGE_PATH } from 'src/common/const/path.const';
import { BaseModel } from 'src/common/entity/base.entity';
import { emailValidationMessage } from 'src/common/validator/message/email-validation.message';
import { lengthValidationMessage } from 'src/common/validator/message/length-validation.message';
import { stringValidationMessage } from 'src/common/validator/message/type-validation.message';
import { PostEntity } from 'src/post/entity/post.entity';
import { TeamEntity } from 'src/team/entity/team.entity';
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';

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

  @Column({
    nullable: true,
  })
  @Transform(({ value }) => value && `${join(PROFILE_IMAGE_PATH, value)}`)
  profile?: string;

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
  lead: TeamEntity;

  @OneToOne(() => TeamEntity, team => team.subLeader)
  subLead: TeamEntity;
}
