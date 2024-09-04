import { ImageModel } from 'src/common/entity/image.entity';
import { Entity, ManyToOne } from 'typeorm';
import { PostEntity } from './post.entity';

@Entity()
export class PostImageEntity extends ImageModel {
  @ManyToOne(() => PostEntity, post => post.images)
  post: PostEntity;
}
