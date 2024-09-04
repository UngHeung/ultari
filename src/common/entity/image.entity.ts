import { Column, Entity } from 'typeorm';
import { BaseModel } from './base.entity';
import { ImageTypeEnum } from '../enum/image.enum';
import { IsNumber, IsString } from 'class-validator';

@Entity()
export class ImageModel extends BaseModel {
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
}
