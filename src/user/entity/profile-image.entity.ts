import { IsString } from 'class-validator';
import { ImageModel } from 'src/common/entity/image.entity';
import { Column, Entity, OneToOne } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity()
export class ProfileImageEntity extends ImageModel {
  @OneToOne(() => UserEntity, user => user.profile, { onDelete: 'CASCADE' })
  user: UserEntity;

  @Column()
  @IsString()
  path: string;
}
