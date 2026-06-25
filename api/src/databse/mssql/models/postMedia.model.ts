import {
  BelongsTo,
  Column,
  DataType,
  Default,
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
  BlobName = 'BlobName',
  FileName = 'FileName',
  MimeType = 'MimeType',
  FileSize = 'FileSize',
}

@Table({
  tableName: Tables.tbl_postMedia, // Ensure this matches your SQL table exactly
  timestamps: false,
})
export class PostMedia extends Model<PostMedia> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: SQLDataType.UNIQUEIDENTIFIER,
    allowNull: false
  })
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

  @Column({ type: `${SQLDataType.VARCHAR}(1000)`, allowNull: true })
  [PostMediaColumns.BlobName]?: string;

  @Column({ type: `${SQLDataType.VARCHAR}(255)`, allowNull: true })
  [PostMediaColumns.FileName]?: string;

  @Column({ type: `${SQLDataType.VARCHAR}(100)`, allowNull: true })
  [PostMediaColumns.MimeType]?: string;

  @Column({ type: DataType.BIGINT, allowNull: true })
  [PostMediaColumns.FileSize]?: number;

  @BelongsTo(() => Posts, {
    foreignKey: PostMediaColumns.PostID,
    targetKey: 'ID',
    as: 'Post',
    onDelete: 'CASCADE', // If a post is deleted, delete its media too!
  })
  Post!: Posts;
}