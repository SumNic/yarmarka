import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';

export enum CategoryType {
  PRODUCT = 'product',
  SERVICE = 'service',
  JOB = 'job',
}

export interface SubcategoryCreationAttrs {
  name: string;
  type: CategoryType;
  isCustom?: boolean;
}

@Table({ tableName: 'subcategories', timestamps: true })
export class Subcategory extends Model<Subcategory, SubcategoryCreationAttrs> {
  @ApiProperty({ type: Number })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ApiProperty({ type: String, description: 'Название подкатегории' })
  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @ApiProperty({ 
    type: String, 
    description: 'Тип категории (product/service/job)',
    enum: CategoryType,
  })
  @Column({
    type: DataType.ENUM(...Object.values(CategoryType)),
    allowNull: false,
  })
  declare type: CategoryType;

  @ApiProperty({ type: Boolean, description: 'Пользовательская подкатегория', default: false })
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare isCustom: boolean;
}
