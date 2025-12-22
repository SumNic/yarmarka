import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'you@mail.ru',
    description: 'Почта пользователя',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'qwerty123',
    description: 'Пароль пользователя',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'Иван',
    description: 'Имя пользователя',
  })
  @IsString()
  name: string;
}
