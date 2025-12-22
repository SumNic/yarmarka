import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
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
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  declare title: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare description: string;

  @Column({ type: DataType.FLOAT, allowNull: true })
  declare salary: number;

  @Column({ type: DataType.STRING, allowNull: true })
  declare category: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare userId: number;

  @BelongsTo(() => User)
  declare user: User;
}
