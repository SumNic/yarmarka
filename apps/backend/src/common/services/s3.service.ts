import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

export interface S3UploadResult {
  key: string;
  url: string;
  contentType: string;
  size: number;
}

@Injectable()
export class S3Service {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>('S3_BUCKET')!;
    this.publicBaseUrl = this.configService.get<string>('S3_PUBLIC_BASE_URL')!;

    this.s3 = new S3Client({
      region: this.configService.get<string>('S3_REGION')!,
      endpoint: this.configService.get<string>('S3_ENDPOINT')!,
      credentials: {
        accessKeyId: this.configService.get<string>('S3_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get<string>(
          'S3_SECRET_ACCESS_KEY',
        )!,
      },
      forcePathStyle: true,
    });
  }

  async uploadPublicImage(params: {
    folder: string;
    file: Express.Multer.File;
  }): Promise<S3UploadResult> {
    const { folder, file } = params;

    const safeFolder = folder.replace(/^\/+|\/+$/g, '');
    const extension = this.getExtensionFromMimetypeOrOriginalName(file);
    const key = `${safeFolder}/${uuidv4()}${extension ? `.${extension}` : ''}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      }),
    );

    return {
      key,
      url: this.buildPublicUrl(key),
      contentType: file.mimetype,
      size: file.size,
    };
  }

  private buildPublicUrl(key: string) {
    return `${this.publicBaseUrl.replace(/\/+$/g, '')}/${key}`;
  }

  private getExtensionFromMimetypeOrOriginalName(file: Express.Multer.File) {
    const nameExt = file.originalname.split('.').pop();
    if (nameExt && nameExt !== file.originalname) return nameExt.toLowerCase();

    const typeExt = file.mimetype.split('/').pop();
    return typeExt ? typeExt.toLowerCase() : '';
  }
}
