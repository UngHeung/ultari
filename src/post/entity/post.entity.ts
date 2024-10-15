import { IsOptional, Length } from 'class-validator';
import { BaseModel } from 'src/common/entity/base.entity';
import { lengthValidationMessage } from 'src/common/validator/message/length-validation.message';
import { UserEntity } from 'src/user/entity/user.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ContentTypeEnum, PublicEnum } from '../enum/post.enum';
import { PostImageEntity } from './post-image.entity';

@Entity()
export class PostEntity extends BaseModel {
  @Column({ nullable: false })
  @Length(2, 20, { message: lengthValidationMessage })
  title: string;

  @Column({ nullable: false })
  @Length(2, 300, { message: lengthValidationMessage })
  content: string;

  @Column({
    enum: PublicEnum,
    default: PublicEnum.PUBLIC,
  })
  visibility?: PublicEnum;

  @Column({
    enum: ContentTypeEnum,
    default: ContentTypeEnum.FREE,
  })
  contentType?: ContentTypeEnum;

  @Column({ default: 0 })
  @IsOptional()
  likeCount: number;

  @Column({ default: 0 })
  @IsOptional()
  viewCount: number;

  @ManyToOne(() => UserEntity, user => user.posts, {
    nullable: false,
    eager: true,
  })
  author: UserEntity;

  @ManyToMany(() => UserEntity, user => user.likedPosts)
  @JoinTable()
  likers?: UserEntity[];

  @OneToMany(() => PostImageEntity, image => image.post)
  images?: PostImageEntity[];

  @Column()
  @IsOptional()
  comments?: string; // will change type to comments entity
}
