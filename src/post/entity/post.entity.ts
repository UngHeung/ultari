import { IsOptional } from 'class-validator';
import { BaseModel } from 'src/common/entity/base.entity';
import { UserEntity } from 'src/user/entity/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

export enum PublicEnum {
  PUBLIC = 'SCOPE_PUBLIC',
  PASTURE = 'SCOPE_TEAM',
  PRIVATE = 'SCOPE_PERSONAL',
}

@Entity()
export class PostEntity extends BaseModel {
  @Column({
    nullable: false,
  })
  postTitle: string;

  @Column({
    nullable: false,
  })
  postContent: string;

  @Column()
  @IsOptional()
  postImages: string[];

  @Column({
    enum: Object.values(PublicEnum),
    default: PublicEnum.PUBLIC,
  })
  postPublicScope: string;

  @ManyToOne(() => UserEntity, user => user.posts)
  PostAuthor: UserEntity;
}
