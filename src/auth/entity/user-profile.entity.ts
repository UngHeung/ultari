import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserProfileEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  imagePath: string;
}
