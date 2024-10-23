import { IsString } from 'class-validator';
import { BaseModel } from 'src/common/entity/base.entity';
import { PostEntity } from 'src/post/entity/post.entity';
import { UserEntity } from 'src/user/entity/user.entity';
import { Column, ManyToOne } from 'typeorm';

interface HasCommentEntityOptions {
  comments: CommentBase<HasCommentsEntities>[];
}

export type HasCommentsEntities = PostEntity;

export class CommentBase<T extends HasCommentEntityOptions> extends BaseModel {
  @Column({ nullable: false })
  @IsString()
  content: string;

  @ManyToOne(() => UserEntity, user => user.comments)
  writer: UserEntity;

  @ManyToOne(
    () => Object as () => T,
    (target: T) => (target as HasCommentEntityOptions).comments,
  )
  target: T;
}
