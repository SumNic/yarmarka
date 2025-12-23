import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Мёд липовый', description: 'Название товара' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Натуральный мёд с пасеки',
    required: false,
    description: 'Описание',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 500, description: 'Цена' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'Еда', required: false, description: 'Категория' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({
    example: ['https://storage.yandexcloud.net/bucket/products/xxx.jpg'],
    required: false,
    description: 'Ссылки на фото товара (до 10 шт.)',
  })
  @IsArray()
  @ArrayMaxSize(10)
  @IsUrl({}, { each: true })
  @IsOptional()
  photoUrls?: string[];

  @ApiProperty({ example: 1, description: 'ID пользователя-владельца' })
  @IsInt()
  userId: number;
}
