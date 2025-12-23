import { BelongsToMany, Column, DataType, Model, Table } from 'sequelize-typescript/dist';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/common/models/User.model';
import { UserRoles } from 'src/common/models/User-roles.model';

interface RolesCreationAttrs {
    value: string;
}

@Table({ tableName: 'roles' })
export class Role extends Model<Role, RolesCreationAttrs> {
    @ApiProperty({ type: Number })
    @Column({
        type: DataType.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
    })
    declare id: number;

    @ApiProperty({ type: String })
    @Column({ type: DataType.STRING, unique: true, allowNull: false })
    declare value: string;

    @ApiProperty({ type: () => [User] })
    @BelongsToMany(() => User, () => UserRoles)
    declare users: User[];
}
