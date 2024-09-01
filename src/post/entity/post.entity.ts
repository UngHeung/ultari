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

@Entity()
export class PostEntity extends BaseModel {
  @Column({ nullable: false })
  @Length(2, 20, { message: lengthValidationMessage })
  postTitle: string;

  @Column({ nullable: false })
  @Length(2, 300, { message: lengthValidationMessage })
  postContent: string;

  @Column()
  @IsOptional()
  postImages: string; // will change type to post images entity

  @Column({
    enum: Object.values(PublicEnum),
    default: PublicEnum.PUBLIC,
  })
  postVisibility: string;

  @ManyToOne(() => UserEntity, user => user.posts)
  PostAuthor: UserEntity;
}
