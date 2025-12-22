import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from 'src/common/models/User.model';

interface ResumeCreationAttrs {
  title: string;
  description?: string;
  skills?: string;
  category?: string;
  userId: number;
}

@Table({ tableName: 'resumes' })
export class Resume extends Model<Resume, ResumeCreationAttrs> {
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

  @Column({ type: DataType.TEXT, allowNull: true })
  declare skills: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare category: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare userId: number;

  @BelongsTo(() => User)
  declare user: User;
}
