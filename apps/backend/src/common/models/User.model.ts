import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/common/models/Product.model';
import { Job } from 'src/common/models/Job.model';
import { Resume } from 'src/common/models/Resume.model';
import { Service } from 'src/common/models/Service.model';

export enum Role {
    ADMIN = 'ADMIN',
    USER = 'USER',
}

export enum EstateType {
    INDIVIDUAL = 'INDIVIDUAL',
    SETTLEMENT = 'SETTLEMENT',
}

interface UserCreationAttrs {
    email: string;
    password: string;
    name: string;
    role?: Role;

    country?: string;
    region?: string;
    district?: string;
    isEstate?: boolean;
    estateType?: EstateType;
    settlement?: string;
}

@Table({ tableName: 'users' })
export class User extends Model<User, UserCreationAttrs> {
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
    email: string;

    @Column({ type: DataType.STRING, allowNull: false })
    password: string;

    @Column({ type: DataType.STRING, allowNull: false })
    name: string;

    @Column({ type: DataType.ENUM(...Object.values(Role)), defaultValue: Role.USER })
    role: Role;

    @Column({ type: DataType.STRING, allowNull: true })
    country: string;

    @Column({ type: DataType.STRING, allowNull: true })
    region: string;

    @Column({ type: DataType.STRING, allowNull: true })
    district: string;

    @Column({ type: DataType.BOOLEAN, defaultValue: false })
    isEstate: boolean;

    @Column({ type: DataType.ENUM(...Object.values(EstateType)), allowNull: true })
    estateType: EstateType;

    @Column({ type: DataType.STRING, allowNull: true })
    settlement: string;

    @HasMany(() => Product)
    products: Product[];

    @HasMany(() => Service)
    services: Service[];

    @HasMany(() => Job)
    jobs: Job[];

    @HasMany(() => Resume)
    resumes: Resume[];
}
