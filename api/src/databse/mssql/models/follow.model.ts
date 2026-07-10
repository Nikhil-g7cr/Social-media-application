import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  Default,
} from 'sequelize-typescript';
import { Users } from './user.model';
import { Tables } from '../connection/tables.mssql';

export const enum FollowColumns {
  ID = 'ID',
  FollowerID = 'FollowerID',
  FollowingID = 'FollowingID',
  Status = 'Status',
  CreatedAt = 'CreatedAt',
}

export const enum FollowStatus{
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

@Table({
  tableName: Tables.tbl_Follow,
  timestamps: false,
})
export class Follow extends Model<Follow> {
  @PrimaryKey
  @Column({
    defaultValue: DataType.UUIDV4,
    type: DataType.UUID,
    primaryKey: true,
  })
  [FollowColumns.ID]!: string;

  @ForeignKey(() => Users)
  @Column(DataType.UUID)
  [FollowColumns.FollowerID]!: string;

  @ForeignKey(() => Users)
  @Column(DataType.UUID)
  [FollowColumns.FollowingID]!: string;

  @BelongsTo(() => Users, {
    foreignKey: 'FollowerID',
    as: 'Follower',
  })
  Follower!: Users;

  @BelongsTo(() => Users, {
    foreignKey: 'FollowingID',
    as: 'Following',
  })
  Following!: Users;

  @Default('PENDING')
  @Column({
    type: DataType.STRING(20),
    allowNull: false,
  })
  Status!: string;

  @Default(DataType.NOW)
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  CreatedAt!: Date;
}
