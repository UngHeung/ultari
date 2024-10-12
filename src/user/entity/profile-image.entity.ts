import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';
import { join } from 'path';
import { PROFILE_IMAGE_PATH } from 'src/common/const/path.const';
import { ImageModel } from 'src/common/entity/image.entity';
import { Column, Entity, OneToOne } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity()
export class ProfileImageEntity extends ImageModel {
  @OneToOne(() => UserEntity, user => user.profile, { onDelete: 'CASCADE' })
  user: UserEntity;

  @Column()
  @IsString()
  @Transform(({ value }) => value && `${join(PROFILE_IMAGE_PATH, value)}`)
  path: string;
}
