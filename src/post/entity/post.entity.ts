import { IsNumber, IsOptional, IsString, Length } from 'class-validator';
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
  @IsString()
  @Length(2, 20, { message: lengthValidationMessage })
  title: string;

  @Column({ nullable: false })
  @IsString()
  @Length(2, 1000, { message: lengthValidationMessage })
  content: string;

  @Column({
    enum: PublicEnum,
    nullable: false,
    default: PublicEnum.PUBLIC,
  })
  @IsString()
  visibility?: PublicEnum;

  @Column({
    enum: ContentTypeEnum,
    nullable: false,
    default: ContentTypeEnum.FREE,
  })
  @IsString()
  contentType?: ContentTypeEnum;

  @Column({ nullable: false, default: 0 })
  @IsNumber()
  likeCount: number;

  @Column({ nullable: false, default: 0 })
  @IsNumber()
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
