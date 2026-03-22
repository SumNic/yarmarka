import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class LocationItemDto {
  @ApiProperty({ example: 'Россия', description: 'Страна' })
  @IsString()
  country: string;

  @ApiProperty({ example: 'Московская область', description: 'Регион', required: false })
  @IsString()
  @IsOptional()
  region?: string;

  @ApiProperty({ example: 'Истринский', description: 'Район/Населенный пункт', required: false })
  @IsString()
  @IsOptional()
  locality?: string;
}

export class CreateLocationsDto {
  @ApiProperty({
    type: [LocationItemDto],
    description: 'Массив локаций для добавления',
    example: [
      { country: 'Россия', region: 'Московская область', locality: 'Истринский' },
      { country: 'Россия', region: 'Чувашия', locality: 'Алатырский' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocationItemDto)
  locations: LocationItemDto[];
}
