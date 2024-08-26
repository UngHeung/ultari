import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as config from 'config';

const dbConfig: {
  type: 'postgres' | any;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
} = config.get('db');

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: dbConfig.type,
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  entities: [__dirname + '/../**/*.entity.{ts}'],
  autoLoadEntities: true,
  synchronize: dbConfig.synchronize,
};
