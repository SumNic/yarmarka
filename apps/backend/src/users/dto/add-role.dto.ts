import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';
// import { IsInt, IsString } from 'class-validator';

export class AddRoleDto {
    @ApiProperty({
        example: 'admin',
        description: 'Название существующей роли',
    })
    @IsString({ message: 'Должно быть строкой' })
    readonly value: string;

    @ApiProperty({
        example: '1',
        description: 'Идентификатор пользователя',
    })
    @IsInt({ message: 'Должно быть числом' })
    readonly userId: number;
}
