import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
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
  password: string;
}
