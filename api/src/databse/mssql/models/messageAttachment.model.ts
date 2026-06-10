import { BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Tables } from '../connection/tables.mssql';
import { SQLDataType } from 'src/core/enums/data-type-sql.enum';
import { Message } from './message.model';

@Table({ tableName: Tables.tbl_Message_Attachment, timestamps: false })
export class MessageAttachment extends Model<MessageAttachment> { // ✅ Type-safe generic to bypass Sequelize overload errors
  @PrimaryKey
  @Column({ type: `${SQLDataType.VARCHAR}(36)`, allowNull: false })
  ID!: string;

  @ForeignKey(() => Message)
  @Column({ type: `${SQLDataType.VARCHAR}(36)`, allowNull: false })
  Message_id!: string; // Maps directly to your 'Message_id' column

  @Column({ type: `${SQLDataType.VARCHAR}(2048)`, allowNull: false })
  FileURL!: string; // Fits safe long URLs for media buckets

  @Column({ type: `${SQLDataType.VARCHAR}(50)`, allowNull: false })
  FileType!: string; // E.g., 'image/png', 'video/mp4'

  @Column({ type: SQLDataType.INT, allowNull: true })
  FileSizeBytes?: number; // File size in bytes

  @Column({ type: SQLDataType.DATETIME, allowNull: false })
  CreatedAt!: Date;

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
}