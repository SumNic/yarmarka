import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';
import { EstateType } from 'src/common/models/User.model';

export class CreateUserDto {
  @ApiProperty({ example: 'you@mail.ru', description: 'Почта пользователя' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'qwerty123',
    description: 'Пароль пользователя (в открытом виде)',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Иван', description: 'Имя пользователя' })
  @IsString()
  name: string;

  @ApiProperty({
    example: false,
    required: false,
    description: 'Признак подтверждения email',
  })
  @IsBoolean()
  @IsOptional()
  isEmailVerified?: boolean;

  @ApiProperty({ example: 'Россия', required: false, description: 'Страна' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({
    example: 'Московская область',
    required: false,
    description: 'Регион',
  })
  @IsString()
  @IsOptional()
  region?: string;

  @ApiProperty({ example: 'Истринский', required: false, description: 'Район' })
  @IsString()
  @IsOptional()
  district?: string;

  @ApiProperty({
    example: false,
    required: false,
    description: 'Является ли пользователь поселением/поместьем',
  })
  @IsBoolean()
  @IsOptional()
  isEstate?: boolean;

  @ApiProperty({
    enum: EstateType,
    required: false,
    description: 'Тип (INDIVIDUAL/SETTLEMENT)',
  })
  @IsEnum(EstateType)
  @IsOptional()
  estateType?: EstateType;

  @ApiProperty({
    example: 'Родовое поселение "Солнечное"',
    required: false,
    description: 'Название поселения',
  })
  @IsString()
  @IsOptional()
  settlement?: string;

  @ApiProperty({
    example: 'https://storage.yandexcloud.net/bucket/users/xxx.jpg',
    required: false,
    description: 'Фото/аватар (URL)',
  })
  @IsUrl()
  @IsOptional()
  photoUrl?: string;
}
