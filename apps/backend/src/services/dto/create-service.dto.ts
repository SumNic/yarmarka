import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

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
    example: 'Красота',
    required: false,
    description: 'Категория',
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ example: 1, description: 'ID пользователя-владельца' })
  @IsInt()
  userId: number;
}
