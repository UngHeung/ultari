import { Column, Entity } from 'typeorm';
import { BaseModel } from 'src/common/entity/base.entity';
import { IsEmail, IsString, Length } from 'class-validator';
import { Exclude, Transform } from 'class-transformer';
import { lengthValidationMessage } from 'src/common/validator/message/length-validation.message';
import { stringValidationMessage } from 'src/common/validator/message/type-validation.message';
import { emailValidationMessage } from 'src/common/validator/message/email-validation.message';
import { join } from 'path';
import { PROFILE_IMAGE_PATH } from 'src/common/const/path.const';

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
  userAccount: string;

  @Column()
  @IsString({ message: stringValidationMessage })
  @Length(8, 20, { message: lengthValidationMessage })
  @Exclude({ toPlainOnly: true })
  userPassword: string;

  @Column()
  @IsString({ message: stringValidationMessage })
  @Length(2, 10, { message: lengthValidationMessage })
  userName: string;

  @Column({ unique: true })
  @IsString({ message: stringValidationMessage })
  @Length(12, 13, { message: lengthValidationMessage })
  userPhone: string;

  @Column({ unique: true })
  @IsString({ message: stringValidationMessage })
  @IsEmail({}, { message: emailValidationMessage })
  userEmail: string;

  @Column({
    nullable: true,
  })
  @Transform(({ value }) => value && `${join(PROFILE_IMAGE_PATH, value)}`)
  userProfilePath?: string;

  @Column({
    enum: Object.values(RoleEnum),
    default: RoleEnum.USER,
  })
  userRole: string;
}
