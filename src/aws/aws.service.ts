import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { extname, join } from 'path';
import { PROJECT_S3_PATH } from 'src/common/const/path.const';
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
    folder: 'post' | 'porfile',
    fileName: string,
    file: Express.Multer.File,
    ext: string,
  ) {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ACL: 'public-read',
      ContentType: `imeage/${ext}`,
    });

    await this.s3Client.send(command);

    return join(PROJECT_S3_PATH, folder, fileName);
  }

  async imageUpload(folder: 'post' | 'porfile', file: Express.Multer.File) {
    const imageName = `${uuid()}${extname(file.originalname)}`;
    console.log('imageName : ', imageName);
    const ext = extname(file.originalname);
    console.log('ext : ', ext);
    const imageUrl = await this.imageUploadToS3(
      folder,
      `${imageName}.${ext}`,
      file,
      ext,
    );
    console.log('imageUrl : ', imageUrl);

    return { imageUrl };
  }
}