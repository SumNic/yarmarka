import { ApiProperty } from '@nestjs/swagger';

export class UploadResultDto {
  @ApiProperty({ example: 'users/uuid.jpg' })
  key: string;

  @ApiProperty({
    example: 'https://storage.yandexcloud.net/bucket/users/uuid.jpg',
  })
  url: string;
}
