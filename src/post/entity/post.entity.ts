import { IsOptional, Length } from 'class-validator';
import { BaseModel } from 'src/common/entity/base.entity';
import { lengthValidationMessage } from 'src/common/validator/message/length-validation.message';
import { UserEntity } from 'src/user/entity/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

export enum PublicEnum {
  PUBLIC = 'SCOPE_PUBLIC',
  PASTURE = 'SCOPE_TEAM',
  PRIVATE = 'SCOPE_PERSONAL',
}

export enum ContentTypeEnum {
  THANKS = 'TYPE_THANKS',
  PRAYER = 'TYPE_PRAYER',
  SHARE = 'TYPE_SHARE',
  FREE = 'TYPE_FREE',
}

@Entity()
export class PostEntity extends BaseModel {
  @Column({ nullable: false })
  @Length(2, 20, { message: lengthValidationMessage })
  title: string;

  @Column({ nullable: false })
  @Length(2, 300, { message: lengthValidationMessage })
  content: string;

  @Column()
  @IsOptional()
  images: string; // will change type to post images entity

  @Column({
    enum: PublicEnum,
    default: PublicEnum.PUBLIC,
  })
  public: PublicEnum;

  @Column({
    enum: ContentTypeEnum,
    default: ContentTypeEnum.FREE,
  })
  type: ContentTypeEnum;

  @Column()
  @IsOptional()
  likeCount: number;

  @Column()
  @IsOptional()
  viewCount: number;

  @ManyToOne(() => UserEntity, user => user.posts)
  author: UserEntity;

  @Column()
  @IsOptional()
  comment: any; // will change type to comments entity
}
