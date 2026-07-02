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
import { Users } from './user.model';

export const enum RefreshTokenColumns {
  ID = 'ID',
  UserID = 'UserID',
  RefreshTokenHash = 'RefreshTokenHash',
  ExpiresAt = 'ExpiresAt',
  IsRevoked = 'IsRevoked',
  CreatedAt = 'CreatedAt',
}

@Table({
  tableName: 'tbl_RefreshToken', // Matches your SQL table exactly
  timestamps: false,
})
export class RefreshToken extends Model<RefreshToken> {
  @PrimaryKey
  @Column({ type: SQLDataType.UNIQUEIDENTIFIER, allowNull: false })
  [RefreshTokenColumns.ID]!: string;

  @ForeignKey(() => Users)
  @Column({ type: SQLDataType.UNIQUEIDENTIFIER, allowNull: false })
  [RefreshTokenColumns.UserID]!: string;

  // Storing a hashed version of the token for security
  @Column({ type: `${SQLDataType.VARCHAR}(500)`, allowNull: false }) 
  [RefreshTokenColumns.RefreshTokenHash]!: string;

  // Explicit expiration date set by your Auth logic
  @Column({ type: DataType.DATE, allowNull: false })
  [RefreshTokenColumns.ExpiresAt]!: Date;

  // Sequelize BOOLEAN automatically maps to SQL Server's BIT type (0 or 1)
  @Column({ 
    type: DataType.BOOLEAN, 
    allowNull: false, 
    defaultValue: false 
  })
  [RefreshTokenColumns.IsRevoked]!: boolean;

  // Let SQL handle the creation time automatically
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('GETDATE()'),
  })
  [RefreshTokenColumns.CreatedAt]!: Date;

  // Relationships
  @BelongsTo(() => Users, {
    foreignKey: RefreshTokenColumns.UserID,
    targetKey: 'ID',
    as: 'User',
    onDelete: 'CASCADE', // If a user deletes their account, wipe their tokens automatically!
  })
  User!: Users;
}