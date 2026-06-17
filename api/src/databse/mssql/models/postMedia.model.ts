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
import { Posts } from './post.model';

export const enum PostMediaColumns {
  ID = 'ID',
  PostID = 'PostID',
  MediaType = 'MediaType', // e.g., 'IMAGE', 'VIDEO'
  MediaURL = 'MediaURL',
  DisplayOrder = 'DisplayOrder',
  CreatedAt = 'CreatedAt',
}

@Table({
  tableName: Tables.tbl_postMedia, // Ensure this matches your SQL table exactly
  timestamps: false,
})
export class PostMedia extends Model<PostMedia> {
  @PrimaryKey
  @Column({ type: SQLDataType.UNIQUEIDENTIFIER, allowNull: false })
  [PostMediaColumns.ID]!: string;

  @ForeignKey(() => Posts)
  @Column({ type: SQLDataType.UNIQUEIDENTIFIER, allowNull: false })
  [PostMediaColumns.PostID]!: string;

  @Column({ type: `${SQLDataType.VARCHAR}(20)`, allowNull: false })
  [PostMediaColumns.MediaType]!: string;

  @Column({ type: `${SQLDataType.VARCHAR}(1000)`, allowNull: false })
  [PostMediaColumns.MediaURL]!: string;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 1 })
  [PostMediaColumns.DisplayOrder]!: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('GETDATE()'),
  })
  [PostMediaColumns.CreatedAt]!: Date;

  @BelongsTo(() => Posts, {
    foreignKey: PostMediaColumns.PostID,
    targetKey: 'ID',
    as: 'Post',
    onDelete: 'CASCADE', // If a post is deleted, delete its media too!
  })
  Post!: Posts;
}