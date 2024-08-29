import { BaseModel } from 'src/common/entity/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class UserProfileEntity extends BaseModel {
  @Column({
    type: 'varchar',
  })
  imagePath: string;
}
