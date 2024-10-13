import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AwsService {
  s3Client: S3Client;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
      },
    });
  }

  async imageUploadToS3(
    folder: 'post' | 'porfile' | 'temp',
    fileName: string,
    file: Express.Multer.File,
    ext: string,
  ) {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `public/images/${folder}/${fileName}`,
      Body: file.buffer,
      ACL: 'public-read',
      ContentType: `image/${ext}`,
    });

    await this.s3Client.send(command);

    return `https://s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_S3_BUCKET_NAME}/public/images/${folder}/${fileName}`;
  }

  async imageUpload(
    folder: 'post' | 'porfile' | 'temp',
    file: Express.Multer.File,
  ) {
    const imageName = uuid();
    const ext = extname(file.originalname).slice(1);

    return await this.imageUploadToS3(folder, `${imageName}.${ext}`, file, ext);
  }
}
