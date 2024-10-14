import {
  CopyObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { BadRequestException, Injectable } from '@nestjs/common';
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
    console.log('file : ', file);
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `public/images/${folder}/${fileName}`,
      Body: file.buffer,
      ACL: 'public-read-write',

      ContentType: `image/${ext}`,
    });

    try {
      await this.s3Client.send(command);

      return {
        fileName,
      };
    } catch (error) {
      throw new BadRequestException('잘못된 요청입니다.');
    }
  }

  async imageUpload(
    folder: 'post' | 'porfile' | 'temp',
    file: Express.Multer.File,
  ) {
    const imageName = uuid();
    const ext = extname(file.originalname).slice(1);

    return await this.imageUploadToS3(folder, `${imageName}.${ext}`, file, ext);
  }

  async moveImage(currentKey: string, newKey: string) {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;

    const moveResponse = await this.s3Client.send(
      new CopyObjectCommand({
        Bucket: bucketName,
        CopySource: `${bucketName}/${currentKey}`,
        Key: newKey,
      }),
    );

    const deleteResponse = await this.deleteImage(currentKey);

    return {
      moveResponse,
      deleteResponse,
    };
  }

  async deleteImage(currentKey: string) {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;

    return await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: currentKey,
      }),
    );
  }
}
