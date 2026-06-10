import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { Conversation } from './conversation.model';
import { MessageAttachment } from './message-attachment.model';

@Table({
  tableName: 'Messages',
  timestamps: false, // We explicitly handle CreatedAt and ModifiedAt/UpdatedAt
})
export class Message extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => Conversation)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  conversation_id: string;

  @Column({
    type: DataType.UUID,
    allowNull: false, // Will point to your Users.id once the User model is introduced
  })
  sender_id: string;

  @Column({
    type: DataType.STRING(4000), // NVARCHAR(4000) inside MS SQL (Supports Unicode / Emojis)
    allowNull: true,
  })
  message_text: string;

  @Column({
    type: DataType.BOOLEAN, // Maps to BIT inside MS SQL
    allowNull: false,
    defaultValue: false,
  })
  is_read: boolean;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  created_at: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  modified_at: Date;

  // Relationships
  @BelongsTo(() => Conversation)
  conversation: Conversation;

  @HasMany(() => MessageAttachment, { onDelete: 'CASCADE' })
  attachments: MessageAttachment[];
}