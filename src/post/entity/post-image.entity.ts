import { ImageModel } from 'src/common/entity/image.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { PostEntity } from './post.entity';
import { IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { POST_IMAGE_PATH } from 'src/common/const/path.const';
import { join } from 'path';

@Entity()
export class PostImageEntity extends ImageModel {
  @ManyToOne(() => PostEntity, post => post.images, { onDelete: 'CASCADE' })
  post: PostEntity;

  @Column()
  @IsString()
  @Transform(({ value, obj }) => `/${join(POST_IMAGE_PATH, value)}`)
  path: string;
}
