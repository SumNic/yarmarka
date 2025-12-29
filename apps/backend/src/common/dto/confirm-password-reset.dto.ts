import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ConfirmPasswordResetDto {
  @ApiProperty({ type: String })
  @IsString()
  token: string;

  @ApiProperty({ type: String, minLength: 6 })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
