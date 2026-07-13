import { BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Tables } from '../connection/tables.mssql';
import { SQLDataType } from '../../../core/enums/sql.enum';
import { Message } from './message.model';
import { Users } from './user.model';
import { MsgAttColumns } from 'src/core/enums/chat.enum';


@Table({ tableName: Tables.tbl_Message_Attachment, timestamps: false })
export class MessageAttachment extends Model<MessageAttachment> { // ✅ Type-safe generic to bypass Sequelize overload errors
  @PrimaryKey
  @Column({ type: `${SQLDataType.VARCHAR}(36)`, allowNull: false })
  [MsgAttColumns.ID]!: string;

  @ForeignKey(() => Message)
  @Column({ type: `${SQLDataType.VARCHAR}(36)`, allowNull: false })
  [MsgAttColumns.Message_id]!: string; // Maps directly to your 'Message_id' column

  @Column({ type: `${SQLDataType.VARCHAR}(2048)`, allowNull: false })
  [MsgAttColumns.FileURL]!: string; // Fits safe long URLs for media buckets

  @Column({ type: `${SQLDataType.VARCHAR}(50)`, allowNull: false })
  [MsgAttColumns.FileType]!: string; // E.g., 'image/png', 'video/mp4'

  @Column({ type: SQLDataType.INT, allowNull: true })
  [MsgAttColumns.FileSizeBytes]?: number; // File size in bytes

  @Column({ type: SQLDataType.DATETIME, allowNull: false })
  [MsgAttColumns.CreatedAt]!: Date;

  @Column({ type: `${SQLDataType.VARCHAR}(255)`, allowNull: true })
  [MsgAttColumns.OriginalFileName]?: string;

  @Column({ type: `${SQLDataType.VARCHAR}(100)`, allowNull: true })
  [MsgAttColumns.MimeType]?: string;

  @Column({ type: `${SQLDataType.VARCHAR}(20)`, allowNull: true })
  [MsgAttColumns.FileExtension]?: string;

  @Column({ type: SQLDataType.INT, allowNull: true })
  [MsgAttColumns.ImageWidth]?: number;

  @Column({ type: SQLDataType.INT, allowNull: true })
  [MsgAttColumns.ImageHeight]?: number;

  @Column({ type: SQLDataType.INT, allowNull: true })
  [MsgAttColumns.VideoDuration]?: number;

  @Column({ type: `${SQLDataType.VARCHAR}(2048)`, allowNull: true })
  [MsgAttColumns.ThumbnailURL]?: string;

  @ForeignKey(() => Users)
  @Column({ type: `${SQLDataType.VARCHAR}(36)`, allowNull: false })
  [MsgAttColumns.UploadedBy]!: string;

  // ==========================================
  // Relationships
  // ==========================================

  @BelongsTo(() => Message, {
    foreignKey: 'Message_id',
    targetKey: 'ID',
    as: 'Message',
    onDelete: 'CASCADE',
  })
  message!: Message;

  @BelongsTo(() => Users, {
    foreignKey: 'UploadedBy',
    targetKey: 'ID',
    as: 'Uploader',
    onDelete: 'NO ACTION',
  })
  uploader!: Users;
}