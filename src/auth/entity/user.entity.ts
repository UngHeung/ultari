import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { UserProfileEntity } from './user-profile.entity';

@Entity()
@Unique(['userAccount'])
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userAccount: string;
  @Column()
  userPassword: string;
  @Column()
  userName: string;
  @Column()
  userPhone: string;
  @Column()
  userEmail: string;
  @Column()
  userRole: string;

  // userProfile : Profile - OneToOne
  @OneToOne(() => UserProfileEntity)
  @JoinColumn()
  userPrfile?: UserProfileEntity;
}
