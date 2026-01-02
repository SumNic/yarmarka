// support.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SupportMessageDto {
  @ApiProperty({
    example: 'Сообщение',
    description: 'Текст сообщения',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  message: string;
}
