import { Column } from 'typeorm';
import { BaseModel } from './base.entity';
import { ImageTypeEnum } from '../enum/image.enum';
import { IsNumber, IsString, Length } from 'class-validator';

export class ImageModel extends BaseModel {
  @Column({ default: 0 })
  @IsNumber()
  order: number;

  @Column({
    enum: ImageTypeEnum,
  })
  @IsString()
  @Length(1, 20)
  type: ImageTypeEnum;

  @Column()
  @IsString()
  path: string;
}
