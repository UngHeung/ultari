import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entity/user.entity';
import { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE } from './const/config.const';
import { UserProfileEntity } from 'src/user/entity/user-profile.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env[DB_HOST],
  port: +process.env[DB_PORT],
  username: process.env[DB_USERNAME],
  password: process.env[DB_PASSWORD],
  database: process.env[DB_DATABASE],
  autoLoadEntities: true,
  entities: [UserEntity, UserProfileEntity],
  synchronize: true,
};
