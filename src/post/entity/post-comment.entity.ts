import { CommentModel } from 'src/common/entity/comment.entity';
import { UserEntity } from 'src/user/entity/user.entity';
import { Entity, ManyToOne } from 'typeorm';
import { PostEntity } from './post.entity';

@Entity()
export class PostCommentEntity extends CommentModel {
  @ManyToOne(() => PostEntity, post => post.comments)
  post: PostEntity;

  @ManyToOne(() => UserEntity, user => user.comments)
  writer: UserEntity;
}
