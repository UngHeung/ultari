import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { extname, join } from 'path';
import { PROJECT_S3_PATH } from 'src/common/const/path.const';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AwsService {
  s3Client: S3Client;
}
