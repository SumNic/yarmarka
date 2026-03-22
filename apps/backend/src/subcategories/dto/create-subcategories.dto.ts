import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CategoryType } from 'src/common/models/Subcategory.model';

export class SubcategoryItemDto {
  @ApiProperty({ example: 'Эко-товары', description: 'Название подкатегории' })
  @IsString()
  name: string;

  @ApiProperty({ 
    example: 'product', 
    description: 'Тип категории',
    enum: CategoryType,
  })
  @IsEnum(CategoryType)
  type: CategoryType;

  @ApiProperty({ example: false, description: 'Пользовательская подкатегория', required: false })
  @IsOptional()
  isCustom?: boolean;
}

export class CreateSubcategoriesDto {
  @ApiProperty({
    type: [SubcategoryItemDto],
    description: 'Массив подкатегорий для добавления',
    example: [
      { name: 'Эко-товары', type: 'product' },
      { name: 'Ремесленные изделия', type: 'product' },
      { name: 'Консультации', type: 'service' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubcategoryItemDto)
  subcategories: SubcategoryItemDto[];
}

export class GetSubcategoriesDto {
  @ApiProperty({
    required: false,
    enum: CategoryType,
    description: 'Фильтр по типу категории',
  })
  @IsEnum(CategoryType)
  @IsOptional()
  type?: CategoryType;
}
