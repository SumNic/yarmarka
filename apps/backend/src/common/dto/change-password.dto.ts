import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ type: String })
  @IsString()
  currentPassword: string;

  @ApiProperty({ type: String, minLength: 6 })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
