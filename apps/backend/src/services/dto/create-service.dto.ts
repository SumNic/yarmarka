import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';
import { Currency } from 'src/common/models/Product.model';

export class CreateServiceDto {
  @ApiProperty({ example: 'Стрижка', description: 'Название услуги' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Мужская/женская стрижка',
    required: false,
    description: 'Описание',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 1200,
    required: false,
    description: 'Цена (если применимо)',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiProperty({
    example: 'RUB',
    required: false,
    description: 'Валюта (RUB, BYN, UAH, KZT)',
    enum: Currency,
    default: Currency.RUB,
  })
  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency;

  @ApiProperty({
    example: 'Красота',
    required: false,
    description: 'Категория',
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({
    example: ['https://storage.yandexcloud.net/bucket/services/xxx.jpg'],
    required: false,
    description: 'Ссылки на фото услуги (до 10 шт.)',
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
