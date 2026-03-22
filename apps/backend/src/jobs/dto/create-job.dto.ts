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

export class CreateJobDto {
  @ApiProperty({ example: 'Плотник', description: 'Название вакансии' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Нужен плотник на стройку',
    required: false,
    description: 'Описание',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 80000,
    required: false,
    description: 'Зарплата (если указана)',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  salary?: number;

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
    example: 'Строительство',
    required: false,
    description: 'Категория',
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({
    example: ['https://storage.yandexcloud.net/bucket/jobs/xxx.jpg'],
    required: false,
    description: 'Ссылки на фото (до 10 шт.)',
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
