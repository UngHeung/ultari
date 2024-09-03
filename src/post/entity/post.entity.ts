import { IsOptional, Length } from 'class-validator';
import { BaseModel } from 'src/common/entity/base.entity';
import { lengthValidationMessage } from 'src/common/validator/message/length-validation.message';
import { UserEntity } from 'src/user/entity/user.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { PublicEnum, ContentTypeEnum } from '../enum/post.enum';
import { ImageEntity } from 'src/common/entity/image.entity';

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

  @ManyToOne(() => UserEntity, user => user.posts)
  author: UserEntity;

  @OneToMany(() => ImageEntity, image => image.post)
  images?: ImageEntity[];

  @Column()
  @IsOptional()
  comments?: string; // will change type to comments entity
}
