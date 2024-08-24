import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

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
}
