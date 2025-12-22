import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateResumeDto {
  @ApiProperty({
    example: 'Frontend разработчик',
    description: 'Название резюме',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Опыт 3 года, React/TS',
    required: false,
    description: 'Описание',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'React, TypeScript, Next.js',
    required: false,
    description: 'Навыки (строкой)',
  })
  @IsString()
  @IsOptional()
  skills?: string;

  @ApiProperty({ example: 'IT', required: false, description: 'Категория' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ example: 1, description: 'ID пользователя-владельца' })
  @IsInt()
  userId: number;
}
