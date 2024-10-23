import { BaseModel } from 'src/common/entity/base.entity';
import { PostEntity } from 'src/post/entity/post.entity';
import { UserEntity } from 'src/user/entity/user.entity';
import { Entity, ManyToOne } from 'typeorm';

interface HasCommentEntityOptions {
  comments: CommentEntity<HasCommentsEntities>[];
}

export type HasCommentsEntities = PostEntity;

@Entity()
export class CommentEntity<
  T extends HasCommentEntityOptions,
> extends BaseModel {
  content: string;

  @ManyToOne(() => UserEntity, user => user.comments)
  writer: UserEntity;

  @ManyToOne(
    () => Object as () => T,
    (target: T) => (target as HasCommentEntityOptions).comments,
  )
  target: T;
}
