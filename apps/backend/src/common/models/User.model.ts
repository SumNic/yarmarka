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

export interface UserCreationAttrs {
  email: string;
  password: string;
  name: string;
  role?: Role;

  isEmailVerified?: boolean;
  emailVerificationTokenHash?: string;
  emailVerificationTokenExpiresAt?: Date;
  refreshTokenHash?: string;

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
  declare email: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare password: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @Column({
    type: DataType.ENUM(...Object.values(Role)),
    defaultValue: Role.USER,
  })
  declare role: Role;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare isEmailVerified: boolean;

  @Column({ type: DataType.STRING, allowNull: true })
  declare emailVerificationTokenHash: string | null;

  @Column({ type: DataType.DATE, allowNull: true })
  declare emailVerificationTokenExpiresAt: Date | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare refreshTokenHash: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare country: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare region: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare district: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare isEstate: boolean;

  @Column({
    type: DataType.ENUM(...Object.values(EstateType)),
    allowNull: true,
  })
  declare estateType: EstateType;

  @Column({ type: DataType.STRING, allowNull: true })
  declare settlement: string;

  @HasMany(() => Product)
  declare products: Product[];

  @HasMany(() => Service)
  declare services: Service[];

  @HasMany(() => Job)
  declare jobs: Job[];

  @HasMany(() => Resume)
  declare resumes: Resume[];
}
