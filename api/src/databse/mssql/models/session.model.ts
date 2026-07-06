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
import { SQLDataType } from '../../../core/enums/data-type-sql.enum';
import { Tables } from '../connection/tables.mssql';
import { Users } from './user.model';
import { SessionColumns } from 'src/core/enums/session.enum';

/**
 * Session model — contains ONLY active sessions.
 *
 * A row is created on login/signup and removed on logout or expiry.
 * We never store raw tokens — only the bcrypt hash of the refresh token.
 */
@Table({
  tableName: Tables.tbl_Session,
  timestamps: false,
})
export class Session extends Model<Session> {
  @PrimaryKey
  @Column({
    type: SQLDataType.UNIQUEIDENTIFIER,
    allowNull: false,
  })
  [SessionColumns.ID]!: string;

  @ForeignKey(() => Users)
  @Column({
    type: SQLDataType.UNIQUEIDENTIFIER,
    allowNull: false,
  })
  [SessionColumns.UserID]!: string;

  /**
   * bcrypt hash of the refresh token.
   * Never store the plaintext token.
   */
  @Column({
    type: `${SQLDataType.VARCHAR}(1000)`,
    allowNull: false,
  })
  [SessionColumns.RefreshTokenHash]!: string;

  /**
   * Human-readable device summary.
   * Example: "Windows 11 • Chrome • Desktop"
   */
  @Column({
    type: `${SQLDataType.NVARCHAR}(255)`,
    allowNull: true,
  })
  [SessionColumns.DeviceInfo]?: string;

  /**
   * Raw User-Agent header — kept for debugging / fingerprinting.
   */
  @Column({
    type: `${SQLDataType.VARCHAR}(1000)`,
    allowNull: true,
  })
  [SessionColumns.UserAgent]?: string;

  @Column({
    type: `${SQLDataType.VARCHAR}(100)`,
    allowNull: true,
  })
  [SessionColumns.IpAddress]?: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('GETDATE()'),
  })
  [SessionColumns.CreatedAt]!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  [SessionColumns.LastSeenAt]?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  [SessionColumns.ExpiresAt]!: Date;

  @BelongsTo(() => Users, {
    foreignKey: SessionColumns.UserID,
    targetKey: 'ID',
    as: 'User',
    onDelete: 'CASCADE',
  })
  User!: Users;
}