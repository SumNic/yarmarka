import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from 'src/common/models/User.model';

interface JobCreationAttrs {
    title: string;
    description?: string;
    salary?: number;
    category?: string;
    userId: number;
}

@Table({ tableName: 'jobs' })
export class Job extends Model<Job, JobCreationAttrs> {
    @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
    declare id: number;

    @Column({ type: DataType.STRING, allowNull: false })
    title: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    description: string;

    @Column({ type: DataType.FLOAT, allowNull: true })
    salary: number;

    @Column({ type: DataType.STRING, allowNull: true })
    category: string;

    @ForeignKey(() => User)
    @Column({ type: DataType.INTEGER, allowNull: false })
    userId: number;

    @BelongsTo(() => User)
    user: User;
}
