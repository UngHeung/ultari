import { IsString } from 'class-validator';
import { BaseModel } from 'src/common/entity/base.entity';
import { Column } from 'typeorm';

export class CommentModel extends BaseModel {
  @Column({ nullable: false })
  @IsString()
  content: string;
}
