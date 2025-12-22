import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

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
    example: 'Строительство',
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
