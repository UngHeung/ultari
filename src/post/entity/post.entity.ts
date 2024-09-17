import { IsOptional, Length } from 'class-validator';
import { BaseModel } from 'src/common/entity/base.entity';
import { lengthValidationMessage } from 'src/common/validator/message/length-validation.message';
import { UserEntity } from 'src/user/entity/user.entity';
import { Column, Entity, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { PublicEnum, ContentTypeEnum } from '../enum/post.enum';
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
  type?: ContentTypeEnum;

  @Column({ default: 0 })
  @IsOptional()
  likeCount: number;

  @Column({ default: 0 })
  @IsOptional()
  viewCount: number;

  @ManyToOne(() => UserEntity, user => user.posts, { nullable: false })
  author: UserEntity;

  @ManyToMany(() => UserEntity, user => user.likedPosts)
  likers?: UserEntity[];

  @OneToMany(() => PostImageEntity, image => image.post)
  images?: PostImageEntity[];

  @Column()
  @IsOptional()
  comments?: string; // will change type to comments entity
}
