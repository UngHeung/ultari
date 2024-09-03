import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseModel } from './base.entity';
import { ImageTypeEnum } from '../enum/image.enum';
import { IsNumber, IsString } from 'class-validator';
import { PostEntity } from 'src/post/entity/post.entity';

@Entity()
export class ImageEntity extends BaseModel {
  @Column({ default: 0 })
  @IsNumber()
  order: number;

  @Column({
    enum: ImageTypeEnum,
  })
  @IsString()
  type: ImageTypeEnum;

  @Column()
  @IsString()
  path: string;

  @ManyToOne(() => PostEntity, post => post.images)
  post: PostEntity;
}
