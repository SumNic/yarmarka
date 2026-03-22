import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';

export interface LocationCreationAttrs {
  country: string;
  region?: string;
  locality?: string;
}

@Table({ tableName: 'locations', timestamps: true })
export class Location extends Model<Location, LocationCreationAttrs> {
  @ApiProperty({ type: Number })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ApiProperty({ type: String, description: 'Страна' })
  @Column({ type: DataType.STRING, allowNull: false })
  declare country: string;

  @ApiProperty({ type: String, description: 'Регион', required: false })
  @Column({ type: DataType.STRING, allowNull: true })
  declare region: string;

  @ApiProperty({ type: String, description: 'Район/Населенный пункт', required: false })
  @Column({ type: DataType.STRING, allowNull: true })
  declare locality: string;
}
