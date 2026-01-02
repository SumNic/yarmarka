import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ResendConfirmationStatusDto {
  @ApiProperty({ type: String })
  @IsEmail()
  email: string;
}