import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from 'src/common/models/User.model';
import { Product } from 'src/common/models/Product.model';
import { Service } from 'src/common/models/Service.model';
import { Job } from 'src/common/models/Job.model';

interface FavoriteCreationAttrs {
  userId: number;
  productId?: number;
  serviceId?: number;
  jobId?: number;
}

@Table({ tableName: 'favorites', timestamps: true })
export class Favorite extends Model<Favorite, FavoriteCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare userId: number;

  @BelongsTo(() => User)
  declare user: User;

  @ForeignKey(() => Product)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare productId: number;

  @ForeignKey(() => Service)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare serviceId: number;

  @ForeignKey(() => Job)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare jobId: number;
}
