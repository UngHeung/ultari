import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { promises } from 'fs';
import { join } from 'path';
import { UserEntity } from 'src/user/entity/user.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { BaseModel } from './entity/base.entity';

@Injectable()
export class CommonService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * - target : entity name
   * - orderBy : order type ASC or DESC
   * - sort : likes, views
   */
  composeQueryBuilder<T extends BaseModel>(
    repository: Repository<T>,
    target: 'user' | 'post' | 'comments',
    take: number,
    orderBy: 'ASC' | 'DESC',
    sort: string,
    cursor: { id: number; value?: number },
    where?: {
      postId: number;
    },
  ): SelectQueryBuilder<T> {
    if (typeof take !== 'number') {
      take = 10;
    }

    const queryBuilder = repository
      .createQueryBuilder(target)
      .orderBy(`${target}.${sort}`, orderBy)
      .addOrderBy(`${target}.id`, orderBy)
      .take(take + 1);

    const join = where?.postId ? ` AND post.id = :postId` : '';

    if (cursor) {
      if (cursor.value !== -1) {
        queryBuilder
          .where(`${target}.${sort} ${orderBy === 'ASC' ? '>=' : '<='} :value`)
          .andWhere(
            `${target}.id ${sort.includes('id') && orderBy === 'ASC' ? '>' : '<'} :id`,
          );

        if (join) {
          queryBuilder.andWhere('post.id = :postId');
        }

        queryBuilder.setParameters({
          id: cursor.id,
          value: cursor.value,
          postId: where?.postId,
        });
      } else {
        queryBuilder.where(
          `${target}.${sort} ${orderBy === 'ASC' ? '>' : '<'} :id`,
        );

        if (join) {
          queryBuilder.andWhere('post.id = :postId');
        }

        queryBuilder.setParameters({ id: cursor.id, postId: where.postId });
      }
    }

    return queryBuilder;
  }

  /**
   * remove file from S3 bucket
   */
  async removeFile(path: string, fileName: string) {
    const removeFilePath = join(path, fileName);

    await promises.rm(removeFilePath);

    return true;
  }

  /**
   * move file from folder in S3 bucket
   */
  async renameFile(currentPath: string, newPath: string, fileName: string) {
    const renameFilePath = join(currentPath, fileName);

    try {
      await promises.access(renameFilePath);
    } catch (error) {
      throw new BadRequestException('존재하지 않는 파일입니다.');
    }

    const newFolderPath = join(newPath, fileName);

    await promises.rename(renameFilePath, newFolderPath);

    return true;
  }
}
