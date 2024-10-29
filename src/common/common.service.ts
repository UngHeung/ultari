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
   * target : entity name
   * order : property
   * orderBy : order type ASC or DESC
   */
  composeQueryBuilder<T extends BaseModel>(
    repository: Repository<T>,
    target: 'user' | 'post' | 'comment',
    take: number,
    orderBy: 'ASC' | 'DESC',
    sort: string,
    cursor: { id: number; value: number },
  ): SelectQueryBuilder<T> {
    const queryBuilder = repository
      .createQueryBuilder(target)
      .orderBy(`${target}.${sort}`, orderBy)
      .addOrderBy(`${target}.id`, orderBy)
      .take(take + 1);

    if (cursor) {
      const compareValueQuery = `(${target}.${sort} ${orderBy === 'ASC' ? '>' : '<'} ${cursor.value}) OR (${target}.${sort} = ${cursor.value}`;
      const compareIdQuery = `${target}.id ${sort.includes('id') && orderBy === 'DESC' ? '<' : '>'} ${cursor.id})`;
      const query = `${compareValueQuery} AND ${compareIdQuery}`;

      queryBuilder.where(query, { value: cursor.value, id: cursor.id });
    }

    return queryBuilder;
  }

  /**
   * file remove from S3 bucket
   */
  async removeFile(path: string, fileName: string) {
    const removeFilePath = join(path, fileName);

    await promises.rm(removeFilePath);

    return true;
  }

  /**
   * file move from folder in S3 bucket
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
