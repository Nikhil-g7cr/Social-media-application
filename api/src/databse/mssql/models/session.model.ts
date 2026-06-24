import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Sequelize } from 'sequelize';
import { SQLDataType } from 'src/core/enums/data-type-sql.enum';
import { Tables } from '../connection/tables.mssql';
import { Users } from './user.model';

export const enum SessionColumns {
  ID = 'ID',
  UserID = 'UserID',
  SessionToken = 'SessionToken',
  RefreshToken = 'RefreshToken',
  DeviceInfo = 'DeviceInfo',
  IpAddress = 'IpAddress',
  UserAgent = 'UserAgent',
  IsRevoked = 'IsRevoked',
  ExpiresAt = 'ExpiresAt',
  LastSeenAt = 'LastSeenAt',
  CreatedAt = 'CreatedAt',
}

@Table({
  tableName: Tables.tbl_Session,
  timestamps: false,
})
export class Session extends Model<Session> {
  @PrimaryKey
  @Column({ type: SQLDataType.UNIQUEIDENTIFIER, allowNull: false })
  [SessionColumns.ID]!: string;

  @ForeignKey(() => Users)
  @Column({ type: SQLDataType.UNIQUEIDENTIFIER, allowNull: false })
  [SessionColumns.UserID]!: string;

  @Column({ type: `${SQLDataType.VARCHAR}(1000)`, allowNull: false })
  [SessionColumns.SessionToken]!: string;

  @Column({ type: `${SQLDataType.VARCHAR}(1000)`, allowNull: true })
  [SessionColumns.RefreshToken]?: string | null;

  @Column({ type: `${SQLDataType.VARCHAR}(500)`, allowNull: true })
  [SessionColumns.DeviceInfo]?: string | null;

  @Column({ type: `${SQLDataType.VARCHAR}(100)`, allowNull: true })
  [SessionColumns.IpAddress]?: string | null;

  @Column({ type: `${SQLDataType.VARCHAR}(1000)`, allowNull: true })
  [SessionColumns.UserAgent]?: string | null;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  [SessionColumns.IsRevoked]!: boolean;

  @Column({ type: DataType.DATE, allowNull: false })
  [SessionColumns.ExpiresAt]!: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  [SessionColumns.LastSeenAt]?: Date | null;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('GETDATE()'),
  })
  [SessionColumns.CreatedAt]!: Date;

  @BelongsTo(() => Users, {
    foreignKey: SessionColumns.UserID,
    targetKey: 'ID',
    as: 'User',
    onDelete: 'CASCADE',
  })
  User!: Users;
}
