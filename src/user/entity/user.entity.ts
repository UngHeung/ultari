import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserProfileEntity } from './user-profile.entity';
import { BaseModel } from 'src/common/entity/base.entity';
import { IsNotEmpty, IsString } from 'class-validator';
import { Exclude } from 'class-transformer';

export enum RoleEnum {
  USER = 'ROLE_USER',
  SHEEP = 'ROLE_SHEEP',
  SHEPERD = 'ROLE_SHEPHERD',
  ADMIN = 'ROLE_ADMIN',
}

@Entity()
export class UserEntity extends BaseModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
    length: 15,
  })
  @IsString({ message: '아이디는 string 값을 입력해야 합니다.' })
  @IsNotEmpty({ message: '아이디를 입력해주세요.' })
  userAccount: string;

  @Column()
  @IsString({ message: '비밀번호는 string 값을 입력해야 합니다.' })
  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  @Exclude()
  userPassword: string;

  @Column({
    length: 10,
  })
  @IsString({ message: '이름은 string 값을 입력해야 합니다.' })
  @IsNotEmpty({ message: '이름을 입력해주세요.' })
  userName: string;

  @Column({
    unique: true,
    length: 13,
  })
  @IsString({ message: '연락처는 string 값을 입력해야 합니다.' })
  @IsNotEmpty({ message: '연락처를 입력해주세요.' })
  userPhone: string;

  @Column({
    unique: true,
    length: 30,
  })
  @IsString({ message: '이메일은 string 값을 입력해야 합니다.' })
  @IsNotEmpty({ message: '이메일을 입력해주세요.' })
  userEmail: string;

  @Column({
    enum: Object.values(RoleEnum),
    default: RoleEnum.USER,
  })
  userRole: string;

  // userProfile : Profile - OneToOne
  @OneToOne(() => UserProfileEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  userProfile?: UserProfileEntity | null;
}
