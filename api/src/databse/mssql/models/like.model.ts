import { BelongsTo, Column, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Sequelize } from 'sequelize';
import { Tables } from '../connection/tables.mssql';
import { SQLDataType } from '../../../core/enums/sql.enum';
import { Users } from './user.model';
import { Posts } from './post.model';
import { LikesColumns } from 'src/core/enums/like.enum';

@Table({ tableName: Tables.tbl_Like, timestamps: false })
export class Likes extends Model<Likes> {
  @PrimaryKey
  @Column({ type: SQLDataType.UNIQUEIDENTIFIER, allowNull: false })
  [LikesColumns.ID]!: string;

  @Column({ type: SQLDataType.UNIQUEIDENTIFIER, allowNull: false })
  [LikesColumns.UserID]!: string;

  @Column({ type: SQLDataType.UNIQUEIDENTIFIER, allowNull: false })
  [LikesColumns.PostID]!: string;

  // Let SQL handle the date automatically
  @Column({
    type: SQLDataType.DATETIME,
    allowNull: false,
    defaultValue: Sequelize.literal('GETDATE()')
  })
  [LikesColumns.CreatedAt]!: Date;

  @BelongsTo(() => Users, {
    foreignKey: LikesColumns.UserID,
    targetKey: 'ID',
    as: 'User',
    onDelete: 'NO ACTION'
  })
  User!: Users;

  @BelongsTo(() => Posts, {
    foreignKey: LikesColumns.PostID,
    targetKey: 'ID',
    as: 'Posts',
    onDelete: 'NO ACTION'
  })
  Post!: Posts;
}