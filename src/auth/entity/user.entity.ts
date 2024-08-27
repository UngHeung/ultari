import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserProfileEntity } from './user-profile.entity';

export enum RoleEnum {
  USER = 'ROLE_USER',
  SHEEP = 'ROLE_SHEEP',
  SHEPERD = 'ROLE_SHEPHERD',
  ADMIN = 'ROLE_ADMIN',
}

@Entity()
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    unique: true,
    length: 15,
  })
  userAccount: string;

  @Column({
    type: 'varchar',
    length: 20,
  })
  userPassword: string;

  @Column({
    type: 'varchar',
    length: 10,
  })
  userName: string;

  @Column({
    type: 'varchar',
    unique: true,
    length: 13,
  })
  userPhone: string;

  @Column({
    type: 'varchar',
    unique: true,
    length: 30,
  })
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
  userProfile?: UserProfileEntity;
}
