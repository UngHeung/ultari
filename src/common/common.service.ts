import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { promises } from 'fs';
import { join } from 'path';
import { UserEntity } from 'src/user/entity/user.entity';
import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { BaseModel } from './entity/base.entity';
import { BasePaginateDto } from './dto/base-paginate.dto';
import { FILTER_MAPPER } from './const/filter-mapper.const';

@Injectable()
export class CommonService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /**
   * 1. receive base paginate dto and additional find options, repository from target entity, next page path
   * 2. if dto has page, return page based paginate
   * 3. if dto has not page, return cursor based paginate
   */
  paginate<T extends BaseModel>(
    dto: BasePaginateDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string,
  ) {
    if (dto.page) {
      return;
    } else {
      return;
    }
  }

  /**
   *
   */
  private async pagePaginate<T extends BaseModel>(
    dto: BasePaginateDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
  ) {
    const findOptions = this.composeFindOptions<T>(dto);
    const [data, count] = await repository.findAndCount({
      ...findOptions,
      ...overrideFindOptions,
    });

    return {
      data,
      total: count,
    };
  }

  /**
   *
   */
  private async cursorPaginate<T extends BaseModel>(
    dto: BasePaginateDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path,
  ) {}

  /**
   *
   */
  private composeFindOptions<T extends BaseModel>(
    dto: BasePaginateDto,
  ): FindManyOptions<T> {
    let where: FindOptionsWhere<T> = {};
    let order: FindOptionsOrder<T> = {};

    for (const [key, value] of Object.entries(dto)) {
      if (key.startsWith('where__')) {
        where = {
          ...where,
          ...this.parseFilter(key, value),
        };
      } else if (key.startsWith('order__')) {
        order = {
          ...order,
          ...this.parseFilter(key, value),
        };
      }
    }

    return {
      where,
      order,
    };
  }

  /**
   *
   */
  private parseFilter<T extends BaseModel>(
    key: string,
    value: any,
  ): FindOptionsWhere<T> | FindOptionsOrder<T> {
    const options: FindOptionsWhere<T> = {};
    const split = key.split('__');

    if (split.length !== 2 && split.length !== 3) {
      throw new BadRequestException(`잘못된 key 값입니다. key : ${key}`);
    }

    if (split.length === 2) {
      const [_, field] = split;

      options[field] = value;
    } else {
      const [_, field, operator] = split;

      operator === 'i_like'
        ? (options[field] = FILTER_MAPPER[operator](`%${value}%`))
        : (options[field] = FILTER_MAPPER[operator](value));
    }

    return options;
  }

  /**
   * 1. receive current file name with extention
   * 2. find current profile by received file path and file name
   * 3. delete current profile
   */
  async removeFile(path: string, fileName: string) {
    const removeFilePath = join(path, fileName);

    await promises.rm(removeFilePath);

    return true;
  }

  /**
   * 1. receive current folder and new folder name and file name to move
   * 2. move file to new folder from current folder
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
