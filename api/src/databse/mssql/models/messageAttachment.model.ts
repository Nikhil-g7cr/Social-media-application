import { Table, Column, Model, DataType, ForeignKey, BelongsTo, CreatedAt } from 'sequelize-typescript';
import { Message } from './message.model';

@Table({
  tableName: 'MessageAttachments',
  timestamps: false,
})
export class MessageAttachment extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => Message)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  message_id: string;

  @Column({
    type: DataType.STRING(2048), // Safe long URL size for secure bucket URLs
    allowNull: false,
  })
  file_url: string;

  @Column({
    type: DataType.STRING(50), // e.g. "image/png" or "video/mp4"
    allowNull: false,
  })
  file_type: string;

  @Column({
    type: DataType.INTEGER, // File size tracking in bytes
    allowNull: true,
  })
  file_size_bytes: number;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  created_at: Date;

  // Relationships
  @BelongsTo(() => Message)
  message: Message;
}