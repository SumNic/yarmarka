import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateRoleDto {
    @ApiProperty({
        example: 'admin',
        description: 'Название существующей роли',
    })
    @IsString({ message: 'Должно быть строкой' })
    readonly value: string;
}
