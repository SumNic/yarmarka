import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from 'src/common/models/User.model';
import { Currency } from './Product.model';

interface ServiceCreationAttrs {
  title: string;
  description?: string;
  price?: number;
  currency?: Currency;
  category?: string;
  photoUrls?: string[];
  userId: number;
}

@Table({ tableName: 'services', timestamps: true })
export class Service extends Model<Service, ServiceCreationAttrs> {
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
  declare price: number;

  @Column({
    type: DataType.ENUM(...Object.values(Currency)),
    defaultValue: Currency.RUB,
    allowNull: false,
  })
  declare currency: Currency;

  @Column({ type: DataType.STRING, allowNull: true })
  declare category: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: false,
    defaultValue: [],
  })
  declare photoUrls: string[];

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare userId: number;

  @BelongsTo(() => User)
  declare user: User;
}
