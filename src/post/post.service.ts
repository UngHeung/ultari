import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AwsService } from 'src/aws/aws.service';
import { CommonService } from 'src/common/common.service';
import { UserEntity } from 'src/user/entity/user.entity';
import { DataSource, FindOneOptions, Repository } from 'typeorm';
import { CreatePostImageDto } from './dto/create-post-image.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostCommentEntity } from './entity/post-comment.entity';
import { PostImageEntity } from './entity/post-image.entity';
import { PostEntity } from './entity/post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(PostImageEntity)
    private readonly postImageRepository: Repository<PostImageEntity>,
    @InjectRepository(PostCommentEntity)
    private readonly postCommentRepository: Repository<PostCommentEntity>,
    private readonly commonService: CommonService,
    private readonly awsService: AwsService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * # GET
   * # find Post list for paginate
   */
  async cursorPaginatePost(
    take: number,
    orderBy: 'ASC' | 'DESC',
    sort: string,
    cursor?: { id: number; value: number },
  ): Promise<{
    data: PostEntity[];
    nextCursor: { id: number; value: number } | null;
  }> {
    Logger.log(typeof take);
    Logger.log('take : ', take);
    const dataList = await this.commonService
      .composeQueryBuilder<PostEntity>(
        this.postRepository,
        'post',
        take,
        orderBy,
        sort,
        cursor,
      )
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('author.profile', 'authorProfile')
      .leftJoinAndSelect('author.team', 'authorTeam')
      .select([
        'post.id',
        'post.title',
        'post.content',
        'post.likeCount',
        'post.createAt',
        'post.visibility',
        'post.contentType',
        'author.id',
        'author.name',
        'authorProfile.path',
        'authorTeam.id',
      ])
      .getMany();

    const hasNextPage = dataList.length > take;
    const data = dataList.slice(0, take);
    const nextCursor = hasNextPage
      ? {
          id: data[data.length - 1].id,
          value: data[data.length - 1][sort],
        }
      : null;

    return {
      data,
      nextCursor,
    };
  }

  async cursorPaginateComment(
    postId: number,
    take: number,
    cursor?: { id: number; value: number },
  ): Promise<{
    data: PostCommentEntity[];
    nextCursor: { id: number; value: number } | null;
  }> {
    const dataList = await this.commonService
      .composeQueryBuilder<PostCommentEntity>(
        this.postCommentRepository,
        'comments',
        take,
        'DESC',
        'id',
        cursor,
        { postId },
      )
      .leftJoinAndSelect('comments.post', 'post')
      .leftJoinAndSelect('comments.writer', 'writer')
      .leftJoinAndSelect('writer.profile', 'writerProfile')
      .select([
        'comments.id',
        'comments.content',
        'comments.createAt',
        'writer.id',
        'writer.name',
        'writerProfile.id',
        'writerProfile.path',
        'post.id',
      ])
      .getMany();

    const hasNextPage = dataList.length > take;
    const data = dataList.slice(0, take);
    const nextCursor = hasNextPage
      ? {
          id: data[data.length - 1].id,
          value: data[data.length - 1].id,
        }
      : null;

    return {
      data,
      nextCursor,
    };
  }

  /**
   * # GET
   * # find Post list and query builder
   * # has author, author,profile
   */
  async getPostList() {
    const posts = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('author.profile', 'authorProfile')
      .leftJoinAndSelect('author.team', 'authorTeam')
      .select([
        'post.id',
        'post.title',
        'post.content',
        'post.likeCount',
        'post.createAt',
        'post.visibility',
        'post.contentType',
        'author.id',
        'author.name',
        'authorProfile.path',
        'authorTeam.id',
      ])
      .getMany();

    return posts;
  }

  /**
   * # GET
   * # find Post by id and query builder
   * # has image, author, author.profile
   */
  async getPostDetailById(id: number): Promise<PostEntity> {
    const post = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('author.profile', 'authorProfile')
      .leftJoinAndSelect('post.images', 'images')
      .leftJoinAndSelect('post.likers', 'likers')
      .select([
        'post.id',
        'post.title',
        'post.content',
        'post.contentType',
        'post.visibility',
        'post.likeCount',
        'author.id',
        'author.name',
        'authorProfile.path',
        'likers.id',
      ])
      .where('post.id = :id', { id })
      .getOne();

    if (!post) {
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }

    const comment = await this.postCommentRepository
      .createQueryBuilder('comments')
      .leftJoinAndSelect('comments.post', 'post')
      .leftJoinAndSelect('comments.writer', 'writer')
      .leftJoinAndSelect('writer.profile', 'profile')
      .select([
        'post.id',
        'comments.id',
        'comments.content',
        'comments.createAt',
        'writer.id',
        'writer.name',
        'profile.id',
        'profile.path',
      ])
      .where('post.id = :id', { id })
      .orderBy('comments.id', 'DESC')
      .limit(1)
      .getOne();

    if (comment) {
      post.comments = [comment];
    }

    return post;
  }

  /**
   * # GET
   * find post by keywords
   */
  async findPostList(keywords: string): Promise<PostEntity[]> {
    if (keywords.trim().length < 2) return;

    const postList = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .select([
        'post.id',
        'post.title',
        'post.content',
        'post.likeCount',
        'author.id',
        'author.name',
      ])
      .where('post.title ILIKE :keyword OR post.content ILIKE :keyword', {
        keyword: `%${keywords}%`,
      })
      .getMany();

    return postList;
  }

  /**
   * # PATCH
   * update post
   */
  async updatePost(
    user: UserEntity,
    id: number,
    dto: UpdatePostDto,
  ): Promise<PostEntity> {
    const post = await this.getPostForUpdate({
      where: {
        author: { id: user.id },
        id,
      },
    });

    if (!post) {
      throw new UnauthorizedException('본인의 게시물이 아닙니다.');
    }

    dto.title && (post.title = dto.title);
    dto.content && (post.content = dto.content);
    dto.images && dto.images.length > 0 && (post.images = dto.images);
    dto.visibility && (post.visibility = dto.visibility);
    dto.contentType && (post.contentType = dto.contentType);

    return await this.postRepository.save(post);
  }

  /**
   * async # Patch
   * update comment
   */
  async updateComment(
    user: UserEntity,
    id: number,
    dto: { content: string },
  ): Promise<PostCommentEntity> {
    const comment = await this.getCommentForUpdate({
      where: {
        writer: { id: user.id },
        id,
      },
      relations: { writer: true },
    });

    if (!comment) {
      throw new UnauthorizedException('본인의 댓글이 아닙니다.');
    }

    comment.content = dto.content;

    return await this.postCommentRepository.save(comment);
  }

  /**
   * # Patch
   * update view count
   */
  async getPostForViews(id: number): Promise<PostEntity> {
    const post = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .select(['post.id', 'post.viewCount', 'author.id'])
      .where('post.id = :id', { id })
      .getOne();

    return post;
  }

  async increaseViews(userId: number, postId: number): Promise<void> {
    const post = await this.getPostForViews(postId);

    if (userId && userId !== post.author.id) {
      post.viewCount++;
      await this.postRepository.save(post);
    }
  }

  /**
   * # Patch
   * update like count
   */
  async updateLikes(user: UserEntity, id: number): Promise<number> {
    const post = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.likers', 'likers')
      .select(['post.id', 'author.id', 'likers.id'])
      .where('post.id = :id', { id })
      .getOne();

    if (user.id === post.author.id) {
      throw new BadRequestException(
        '본인의 게시물에 좋아요를 누를 수 없습니다.',
      );
    }

    const exists = this.existsUserInLikers(user.id, post);

    post.likers = await this.addOrDeletePostLikers(user, post, !exists);
    post.likeCount = post.likers.length;

    await this.postRepository.save(post);

    return post.likeCount;
  }

  /**
   * # Base POST
   * create post
   */
  async createPost(
    author: UserEntity,
    dto: CreatePostDto,
  ): Promise<PostEntity> {
    const post = this.postRepository.create({
      ...dto,
      author,
      images: [] as PostImageEntity[],
      comments: [] as PostCommentEntity[],
    });

    return await this.postRepository.save(post);
  }

  /**
   * # Base POST
   * create post image
   */
  async createPostImage(dto: CreatePostImageDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const currentPath = `public/images/temp/${dto.path}`;

    try {
      const result = this.postImageRepository.save(dto);

      await this.awsService.moveImage(
        currentPath,
        `public/images/post/${dto.path}`,
      );

      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      console.error(error);

      await this.awsService.deleteImage(currentPath);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * # Base POST
   * create comment
   */
  async getPostForComment(id: number): Promise<PostEntity> {
    const post = await this.postRepository
      .createQueryBuilder('post')
      .select('post.id')
      .where('post.id = :id', { id })
      .getOne();

    return post;
  }

  async createComment(
    writer: UserEntity,
    dto: { postId: number; content: string },
  ) {
    if (!dto.content) {
      throw new BadRequestException('댓글을 입력해주세요.');
    }

    const post = await this.getPostForComment(dto.postId);

    const comment = this.postCommentRepository.create({
      writer,
      content: dto.content,
      post,
    });

    return await this.postCommentRepository.save(comment);
  }

  /**
   * # Base GET
   * get post simple data
   */
  async getPostForUpdate(findOneOptions: FindOneOptions) {
    return await this.postRepository.findOne({
      ...findOneOptions,
      relations: { author: true, images: true },
      select: { author: { id: true } },
    });
  }

  /**
   * # Base GET
   * get post
   */
  async getPost(
    findOneOptions: FindOneOptions<PostEntity>,
  ): Promise<PostEntity> {
    return await this.postRepository.findOne({
      ...findOneOptions,
      relations: {
        author: { profile: true },
        images: true,
        likers: true,
        comments: {
          writer: true,
        },
      },
      order: {
        comments: {
          createAt: 'DESC',
        },
      },
    });
  }

  /**
   * Base GET
   * get comment by post id
   */
  async getCommentsByPostId(postId: number): Promise<PostCommentEntity[]> {
    const comments = await this.postCommentRepository
      .createQueryBuilder('comments')
      .leftJoinAndSelect('comments.post', 'post')
      .leftJoinAndSelect('comments.writer', 'writer')
      .leftJoinAndSelect('writer.profile', 'writerProfile')
      .select([
        'comments.id',
        'comments.content',
        'comments.createAt',
        'writer.id',
        'writer.name',
        'writerProfile.id',
        'writerProfile.path',
        'post.id',
      ])
      .where('post.id = :id', { id: postId })
      .orderBy('comments.id', 'DESC')
      .getMany();

    return comments;
  }

  /**
   * # Base GET
   * get comment for update
   */
  async getCommentForUpdate(
    findOneOptions: FindOneOptions<PostCommentEntity>,
  ): Promise<PostCommentEntity> {
    return await this.postCommentRepository.findOne({
      ...findOneOptions,
      relations: { writer: true },
    });
  }

  /**
   * # Base GET
   * get comment by id
   */
  async getCommentForDelete(id: number): Promise<PostCommentEntity> {
    return await this.postCommentRepository.findOne({
      where: { id },
      relations: { writer: true },
      select: { writer: { id: true } },
    });
  }

  /**
   * # Base DELETE
   * delete post by id
   */
  async deletePost(user: UserEntity, id: number): Promise<boolean> {
    const post: PostEntity & { images?: PostImageEntity[] } =
      await this.postRepository.findOne({
        where: {
          id: id,
          author: {
            id: user.id,
          },
        },
        relations: { images: true },
      });

    if (!post) throw new BadRequestException('본인의 게시물이 아닙니다.');

    const deleteResult = await this.postRepository.delete(id);

    if (!deleteResult) {
      throw new NotFoundException(`삭제에 실패했습니다.`);
    }

    if (post.images.length > 0) {
      for (let i = 0; i < post.images.length; i++) {
        await this.awsService.moveImage(
          `public/images/post/${post.images[i].path}`,
          `public/images/temp/${post.images[i].path}`,
        );
      }
    }

    return true;
  }

  /**
   * # Base DELETE
   * delete comment
   */
  async deleteComment(user: UserEntity, id: number): Promise<boolean> {
    const comment = await this.getCommentForDelete(id);

    if (!comment) {
      throw new NotFoundException(`삭제할 댓글이 없습니다. id : ${id}`);
    }

    if (comment.writer.id !== user.id) {
      throw new UnauthorizedException('자신의 댓글만 삭제가 가능합니다.');
    }

    const deleteResponse = await this.postCommentRepository.remove(comment);

    return true;
  }

  /**
   * # Base
   */
  async saveImage(file: Express.Multer.File) {
    return await this.awsService.imageUpload('temp', file);
  }

  /**
   * # Base
   */
  async addOrDeletePostLikers(
    user: UserEntity,
    post: PostEntity,
    isSaved: boolean,
  ): Promise<UserEntity[]> {
    if (post.likers?.length <= 0 || isSaved) {
      post.likers = [...post?.likers, user];
    } else {
      post.likers = post.likers.filter(liker => user.id !== liker.id);
    }

    return post.likers;
  }

  /**
   * # Base
   */
  existsUserInLikers(userId: number, post: PostEntity): boolean {
    if (post.likers?.length <= 0) {
      return false;
    }

    for (const liker of post?.likers) {
      if (userId === liker.id) {
        return true;
      }
    }

    return false;
  }
}
