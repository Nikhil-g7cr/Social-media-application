import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  CreatedAt,
  PrimaryKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Users } from './user.model';
import { SQLDataType } from 'src/core/enums/data-type-sql.enum';

@Table({
  tableName: 'Follows',
  timestamps: false, // Explicitly managing only created_at
})
export class Follow extends Model {
  @PrimaryKey
  @Column({ type: SQLDataType.UNIQUEIDENTIFIER, allowNull: false })
  ID!: string;

  // We use a composite primary key using follower_id and following_id
  // This guarantees a user cannot follow the same person more than once

  @ForeignKey(() => Users)
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    allowNull: false,
  })
  follower_id!: string; // The usersUsers who clicks "Follow"

  @ForeignKey(() => Users)
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    allowNull: false,
  })
  following_id!: string; // The usersUsers being followed

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW, // Maps to GETDATE() in SQL Server
  })
  created_at!: Date;

  @BelongsTo(() => Users, {
    foreignKey: 'follower_id',
    as: 'Follower',
  })
  follower!: Users;

  @BelongsTo(() => Users, {
    foreignKey: 'following_id',
    as: 'Following',
  })
  following!: Users;
}
