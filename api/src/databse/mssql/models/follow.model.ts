import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  PrimaryKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Sequelize } from 'sequelize';
import { Users } from './user.model';
import { SQLDataType } from 'src/core/enums/data-type-sql.enum';

export const enum FollowColumns {
  ID = 'ID',
  FollowerID = 'FollowerID',
  FollowingID = 'FollowingID',
  CreatedAt = 'CreatedAt',
}

@Table({
  tableName: 'tbl_Follow', // Match SQL exactly
  timestamps: false,
})
export class Follow extends Model<Follow> { // Added <Follow> generic
  @PrimaryKey
  @Column({ type: SQLDataType.UNIQUEIDENTIFIER, allowNull: false })
  [FollowColumns.ID]!: string;

  @ForeignKey(() => Users)
  @Column({
    type: SQLDataType.UNIQUEIDENTIFIER,
    allowNull: false,
  })
  [FollowColumns.FollowerID]!: string;

  @ForeignKey(() => Users)
  @Column({
    type: SQLDataType.UNIQUEIDENTIFIER,
    allowNull: false,
  })
  [FollowColumns.FollowingID]!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('GETDATE()'), // Let SQL handle the date
  })
  [FollowColumns.CreatedAt]!: Date;

  // Relationships
  @BelongsTo(() => Users, {
    foreignKey: FollowColumns.FollowerID,
    targetKey: 'ID', // Explicitly map to User's ID
    as: 'Follower',
    onDelete: 'NO ACTION'
  })
  follower!: Users;

  @BelongsTo(() => Users, {
    foreignKey: FollowColumns.FollowingID,
    targetKey: 'ID', // Explicitly map to User's ID
    as: 'Following',
    onDelete: 'NO ACTION'
  })
  following!: Users;
}